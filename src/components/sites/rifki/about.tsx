"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Smoothstep helper — matches source w(a, b, v)
function smoothstep(a: number, b: number, v: number) {
  const n = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return n * n * (3 - 2 * n);
}

// Get scroll progress for about section
function getAboutScrollProgress() {
  const section = document.getElementById("about-us");
  if (!section) return 0;
  const sectionHeight = section.offsetHeight - window.innerHeight;
  if (sectionHeight <= 0) return 0;
  return Math.min(Math.max(-section.getBoundingClientRect().top / sectionHeight, 0), 1);
}

// Banded planet shader — matches source custom shader
const planetVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const planetFragmentShader = `
uniform vec3 lightDir;
uniform vec3 topColor;
uniform vec3 midColor;
uniform vec3 bottomColor;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 normal = normalize(vNormal);
  float lightDot = max(dot(normal, normalize(lightDir)), 0.0);
  
  // Banding based on position.y
  float t = (vPosition.y + 1.0) * 0.5;
  vec3 baseColor = mix(bottomColor, midColor, smoothstep(0.0, 0.5, t));
  baseColor = mix(baseColor, topColor, smoothstep(0.5, 1.0, t));
  
  vec3 color = baseColor * (0.3 + 0.7 * lightDot);
  gl_FragColor = vec4(color, 1.0);
}
`;

// Component j — the banded planet sphere
function PlanetSphere() {
  const uniforms = useMemo(
    () => ({
      lightDir: { value: new THREE.Vector3(0.6, 0.75, 0.5).normalize() },
      topColor: { value: new THREE.Color("#f8e6b4") },
      midColor: { value: new THREE.Color("#e0a95c") },
      bottomColor: { value: new THREE.Color("#7a4217") },
    }),
    [],
  );

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={planetVertexShader}
        fragmentShader={planetFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Component C — the point ring around the planet
function PointRing() {
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, setGeo] = useState<{
    positions: Float32Array;
    colors: Float32Array;
    texture: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color("#fff2c4");
    const c2 = new THREE.Color("#f3c074");
    const c3 = new THREE.Color("#5a3a20");

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Source: radius 1.45 + random * (2.30 - 1.45) = 1.45 + random * 0.85
      const radius = 1.45 + Math.random() * 0.85;
      // Source: y offset
      const y = (Math.random() - 0.5) * 0.1;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Source: color gradient from c1 → c2 → c3
      const t = Math.random();
      const color = t < 0.33 ? c1 : t < 0.66 ? c2 : c3;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Create sprite canvas texture for points
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.2, "rgba(255,255,255,0.8)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeo({ positions, colors, texture: new THREE.CanvasTexture(canvas) });
  }, []);

  // Source: useFrame((t, n) => { e.current.rotation.y += .1 * n })  -- .1 * delta
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.1 * delta;
    }
  });

  // Source: pointsMaterial map, vertexColors, transparent, depthWrite false, size .07,
  // sizeAttenuation true, alphaTest .005, opacity .95
  return (
    <points ref={pointsRef}>
      {geo && (
        <>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[geo.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[geo.colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={geo.texture}
            vertexColors
            transparent
            depthWrite={false}
            size={0.07}
            sizeAttenuation
            alphaTest={0.005}
            opacity={0.95}
          />
        </>
      )}
    </points>
  );
}

// Component k — outer group that animates position + scale on scroll
function PlanetGroup() {
  const outerRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Source: let s = e.width, u = e.height, c = min(.35*min(s,u), .217*s)
  // These are computed from R3F viewport, not window
  const s = viewport.width;
  const u = viewport.height;
  const c = Math.min(0.35 * Math.min(s, u), 0.217 * s);

  useFrame(() => {
    const outer = outerRef.current;
    if (!outer) return;

    // Source: let t = .28 * min(s, u), n = w(.02, .85, scrollProgress)
    const t = 0.28 * Math.min(s, u);
    const n = smoothstep(0.02, 0.85, getAboutScrollProgress());

    // Source: e.position.set(lerp(0, -s/2 + .75*t, n), 0, 0)
    outer.position.set(
      THREE.MathUtils.lerp(0, -s / 2 + 0.75 * t, n),
      0,
      0,
    );

    // Source: e.scale.setScalar(lerp(c, t, n))
    outer.scale.setScalar(THREE.MathUtils.lerp(c, t, n));

    // Source: a.current.rotation.x = lerp(.9, .55, n)  — ring group tilt
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.x = THREE.MathUtils.lerp(0.9, 0.55, n);
    }
  });

  // Source structure:
  // <group ref=i, position=[0,0,0], scale=c>
  //   <group rotation=[.15,0,.1]>       ← planet tilt
  //     <PlanetSphere/>
  //   </group>
  //   <group ref=a, rotation=[.9,0,0]>   ← ring group (lerps to .55)
  //     <PointRing/>
  //   </group>
  // </group>
  return (
    <group ref={outerRef} position={[0, 0, 0]} scale={c}>
      {/* Planet with tilt */}
      <group rotation={[0.15, 0, 0.1]}>
        <PlanetSphere />
      </group>
      {/* Ring group — tilt lerps from .9 to .55 on scroll */}
      <group ref={ringGroupRef} rotation={[0.9, 0, 0]}>
        <PointRing />
      </group>
    </group>
  );
}

function AboutScene() {
  return (
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, 12], fov: 45 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      className="absolute inset-0 z-0"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <PlanetGroup />
      </Suspense>
    </Canvas>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Source: heading x [120,0] over [.04,.38], opacity [0,1]
  // body x [140,0] over [.16,.5], opacity [0,1]
  // shared y [60,-60] over [0,1]
  const headingX = useTransform(scrollYProgress, [0.04, 0.38], [120, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0.04, 0.38], [0, 1]);
  const bodyX = useTransform(scrollYProgress, [0.16, 0.5], [140, 0]);
  const bodyOpacity = useTransform(scrollYProgress, [0.16, 0.5], [0, 1]);
  const sharedY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className="relative w-full h-[220svh] scroll-mt-16 bg-[#0b0b0b]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* Three.js canvas — z-0, pointer-events none */}
        <AboutScene />

        {/* Copy — matches source layout exactly:
            flex items-end lg:items-center justify-center lg:justify-end
            px-[10vw] pb-16 lg:pb-0 lg:pr-[10vw] */}
        <div className="relative z-10 flex h-full items-end justify-center px-[10vw] pb-16 lg:items-center lg:justify-end lg:pb-0 lg:pr-[10vw]">
          <motion.div
            className="flex max-w-xl flex-col gap-4 text-center lg:text-left"
            style={{ y: sharedY }}
          >
            <motion.h2
              className="text-2xl font-bold text-[#f5f5f5] lg:text-5xl"
              style={{ x: headingX, opacity: headingOpacity }}
            >
              Introduce
            </motion.h2>
            <motion.p
              className="text-sm font-light text-[#f5f5f5]/80 lg:text-lg"
              style={{ x: bodyX, opacity: bodyOpacity }}
            >
              I&apos;m a full-stack web developer who enjoys making complex ideas feel
              simple to use. I build responsive interfaces, connect them to the
              systems behind them, and add motion when it improves the experience.
              From product interfaces and landing pages to real-time features,
              I care about clear structure, thoughtful details, and work that
              holds up beyond the first screen.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
