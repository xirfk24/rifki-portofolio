"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useLoading } from "./loading-provider";
import { ArrowDown, ArrowRight } from "lucide-react";
import { contactMailto } from "./data";

const MODEL_PATH = "/sites/rifki/astro/models/walking-astronaut.glb";
const KNEE_BONES = ["L_Knee.83", "R_Knee.89"];

// Preload with Draco + Meshopt
useGLTF.preload(MODEL_PATH, true, true);

// Helper: get hero scroll progress (matches source function y())
function getHeroScrollProgress() {
  const section = document.getElementById("hero");
  if (!section) return 0;
  const sectionHeight = section.offsetHeight - window.innerHeight;
  if (sectionHeight <= 0) return 0;
  return Math.min(Math.max(window.scrollY / sectionHeight, 0), 1);
}

function AstronautModel() {
  const { isLoading, setThreeJsLoaded } = useLoading();
  const groupRef = useRef<THREE.Group>(null);
  const baseYRef = useRef(0);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [modelReady, setModelReady] = useState(false);

  const gltf = useGLTF(MODEL_PATH, true, true);

  const { actions, mixer } = useMemo(() => {
    if (!gltf.animations.length) {
      return { actions: {} as Record<string, THREE.AnimationAction>, mixer: null as THREE.AnimationMixer | null };
    }
    const m = new THREE.AnimationMixer(gltf.scene);
    const acts: Record<string, THREE.AnimationAction> = {};
    for (const clip of gltf.animations) {
      acts[clip.name] = m.clipAction(clip);
    }
    return { actions: acts, mixer: m };
  }, [gltf]);

  useEffect(() => {
    mixerRef.current = mixer;
  }, [mixer]);

  // Compute bounding box and scale — exact match to source
  useEffect(() => {
    if (!groupRef.current || !gltf) return;
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const computeScale = () => {
      // Matches original source formula exactly:
      // r = () => {
      //   let e = (window.innerWidth < 768 ? 1.3 : 2.15) / Math.max(i.x, i.y, i.z);
      //   a.current = 1.1 - s.y * e - .5;
      //   n.current.scale.setScalar(e);
      //   n.current.position.set(-s.x * e - .35, a.current, -s.z * e);
      // }
      const e = (window.innerWidth < 768 ? 1.12 : 1.85) / Math.max(size.x, size.y, size.z);
      baseYRef.current = 1.1 - center.y * e - 0.58;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(e);
        groupRef.current.position.set(-center.x * e - 0.35, baseYRef.current, -center.z * e);
      }
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [gltf]);

  // Floating animation
  useEffect(() => {
    if (!actions.floating) return;
    actions.floating.reset().fadeIn(0.5).play();
    return () => {
      actions.floating?.fadeOut(0.4);
    };
  }, [actions]);

  // Wave animation — use GSAP-like timeline (source uses gsap.timeline)
  useEffect(() => {
    if (isLoading || !mixer) return;
    const waveClip = gltf.animations.find((a) => a.name === "wave");
    if (!waveClip) return;

    const rightArmBones = [
      "R_Clevicle", "R_Arm", "R_Elbow", "R_Wrist",
      "R_thumb", "R_index", "R_middle", "R_ring", "R_pinky",
    ];
    const filteredTracks = waveClip.tracks.filter((t) =>
      rightArmBones.some((b) => t.name.startsWith(b)),
    );
    if (!filteredTracks.length) return;

    const waveArmClip = new THREE.AnimationClip("wave-arm", waveClip.duration, filteredTracks);
    const action = mixer.clipAction(waveArmClip);
    action.reset();
    action.setLoop(THREE.LoopRepeat, 1);
    action.clampWhenFinished = true;
    action.play();
    action.timeScale = 0;

    // Timeline: wave out 3s, back 1.5s, repeat after 3s delay
    let elapsed = 0;
    let phase: "out" | "back" | "wait" = "out";
    const outDuration = 3;
    const backDuration = 1.5;
    const waitDuration = 3;

    const interval = setInterval(() => {
      elapsed += 0.05;
      if (phase === "out") {
        const t = Math.min(elapsed / outDuration, 1);
        action.time = waveArmClip.duration * t;
        if (t >= 1) { phase = "back"; elapsed = 0; }
      } else if (phase === "back") {
        const t = Math.min(elapsed / backDuration, 1);
        action.time = waveArmClip.duration * (1 - t);
        if (t >= 1) { phase = "wait"; elapsed = 0; }
      } else {
        if (elapsed >= waitDuration) { phase = "out"; elapsed = 0; }
      }
    }, 50);

    return () => {
      clearInterval(interval);
      action.stop();
      action.fadeOut(0.3);
    };
  }, [isLoading, mixer, gltf]);

  // Knee bones
  const kneeBones = useMemo(() => {
    return KNEE_BONES.map((name) => gltf.scene.getObjectByName(name)).filter(
      (b): b is THREE.Object3D => !!b,
    );
  }, [gltf]);

  // Knee rotation quaternion (Z axis, -0.5 rad)
  const kneeRotation = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.5),
    [],
  );

  // useFrame — exact match to source:
  // rotation.y += (.35*pointer.x + r*2π - rotation.y) * .06  (LERP toward target)
  // rotation.x += (.08*pointer.y - .35*r - rotation.x) * .06
  // rotation.z += (-.3 + .05*pointer.x - rotation.z) * .06
  // position.y = a.current + .05 * sin(.4 * t)
  // knee: quaternion.multiply(p)  (NOT slerp)
  useFrame((state, delta) => {
    const t = groupRef.current;
    if (!t) return;

    const { pointer, clock } = state;
    const r = getHeroScrollProgress();

    // Lerp rotations toward target (source uses += .06 lerp)
    const targetY = 0.35 * pointer.x + r * Math.PI * 2;
    const targetX = 0.08 * pointer.y - 0.35 * r;
    const targetZ = -0.3 + 0.05 * pointer.x;

    t.rotation.y += (targetY - t.rotation.y) * 0.06;
    t.rotation.x += (targetX - t.rotation.x) * 0.06;
    t.rotation.z += (targetZ - t.rotation.z) * 0.06;

    // Y bob — use baseY, NOT accumulated position
    t.position.y = baseYRef.current + 0.05 * Math.sin(0.4 * clock.elapsedTime);

    // Knee rotation — source uses quaternion.multiply (applies increment each frame)
    for (const knee of kneeBones) {
      knee.quaternion.multiply(kneeRotation);
    }

    // Update mixer
    if (mixer) {
      mixer.update(delta);
    }
  });

  // Signal loaded
  useEffect(() => {
    if (!modelReady) {
      const timer = setTimeout(() => {
        setModelReady(true);
        setThreeJsLoaded(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [modelReady, setThreeJsLoaded]);

  useEffect(() => {
    if (groupRef.current && gltf) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModelReady(true);
      setThreeJsLoaded(true);
    }
  }, [gltf, setThreeJsLoaded]);

  return <primitive ref={groupRef} object={gltf.scene} />;
}

// Separate camera controller — matches source component E
function CameraController() {
  const { camera } = useThree();
  const { isLoading } = useLoading();
  const targetRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const r = getHeroScrollProgress();
    const target = targetRef.current;
    // Source: a.set(0, 1.1-.4*r, t?11:3+8*r)
    target.set(0, 1.1 - 0.4 * r, isLoading ? 11 : 4.3 + 8 * r);
    // Source: e.position.lerp(a, 1 - Math.exp(-delta * (t?.6:2.4)))
    camera.position.lerp(target, 1 - Math.exp(-delta * (isLoading ? 0.6 : 2.4)));
    // Camera looks at target y=1.1 (matches source)
    camera.lookAt(0, 1.1, 0);
  });

  return null;
}

function HeroLights() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight color="#ffffff" groundColor="#101018" intensity={0.5} />
      <directionalLight position={[4, 8, 6]} intensity={3} color="#ffffff" />
      <directionalLight position={[-6, 2, -4]} intensity={2} color="#ffab00" />
    </>
  );
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 11], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <HeroLights />
      <CameraController />
      <Suspense fallback={null}>
        <AstronautModel />
      </Suspense>
    </Canvas>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative h-[220svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Top gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#0b0b0b]/80 to-transparent" />

        {/* Three.js canvas */}
        <HeroScene />

        {/* Copy block */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-10 pt-24 lg:justify-start lg:pl-[8vw] lg:pt-28">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-[#f5f5f5]/70 lg:text-sm">
              Full-Stack Web Developer
            </span>
            <h1
              className="text-5xl font-bold lg:text-7xl"
              style={{ fontFamily: '"Covered By Your Grace", cursive' }}
            >
              Hi, I&apos;m <span className="text-[#ffab00]">Rifki</span>!
            </h1>
            <p className="max-w-md text-sm font-light text-[#f5f5f5]/70 lg:text-base">
              I turn ideas into polished web experiences, building from the
              interface all the way to the systems behind it.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <a
                href={contactMailto}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ffab00] px-5 text-sm font-semibold text-[#111] transition-colors hover:bg-[#ffc247] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffab00]"
              >
                Contact me
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#portofolio"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-[#f5f5f5]/80 transition-colors hover:text-[#ffab00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffab00]"
              >
                View projects
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <a
          href="#about-us"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector("#about-us")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group absolute bottom-24 right-6 flex flex-col items-center gap-1 text-[#f5f5f5]/70 transition-colors hover:text-[#ffab00] lg:right-12"
        >
          <span className="text-xs">Scroll to explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
