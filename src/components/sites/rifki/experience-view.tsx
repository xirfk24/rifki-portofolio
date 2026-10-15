"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { experiences } from "./data";
import { SmoothScroll } from "./smooth-scroll";

// Preload all models
experiences.forEach((exp) => useGLTF.preload(exp.modelPath));

function ExperienceModel({
  modelPath,
  onProgress,
}: {
  modelPath: string;
  onProgress: (progress: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const gltf = useGLTF(modelPath);

  useEffect(() => {
    onProgress(100);
  }, [onProgress]);

  // Scale to fit
  useEffect(() => {
    if (!groupRef.current || !gltf) return;
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [gltf]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.position.y += Math.sin(t * 0.8) * 0.002;
  });

  return <primitive ref={groupRef} object={gltf.scene} />;
}

function ExperienceScene({
  modelPath,
  onProgress,
}: {
  modelPath: string;
  onProgress: (progress: number) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 6]} intensity={2} color="#ffffff" />
      <directionalLight position={[-6, 2, -4]} intensity={1.5} color="#ffab00" />
      <Suspense fallback={null}>
        <ExperienceModel modelPath={modelPath} onProgress={onProgress} />
      </Suspense>
    </Canvas>
  );
}

function ExperienceView() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modelProgress, setModelProgress] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const section = sectionRef.current;
      const sectionHeight = section.offsetHeight - window.innerHeight;
      if (sectionHeight <= 0) return;
      const p = Math.min(Math.max(window.scrollY / sectionHeight, 0), 1);

      const idx = Math.round(p * (experiences.length - 1));
      setActiveIndex(idx);

      // Loading complete once progress > 0.02
      if (p > 0.02 && loading) {
        setLoading(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  // Auto-finish loading after models load
  useEffect(() => {
    const allLoaded = experiences.every(
      (_, i) => modelProgress[i] !== undefined && modelProgress[i] >= 100,
    );
    if (allLoaded && loading) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [modelProgress, loading]);

  const handleCompanyClick = (index: number) => {
    if (!sectionRef.current) return;
    const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
    const target = (index / (experiences.length - 1)) * sectionHeight;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const activeExperience = experiences[activeIndex];

  return (
    <>
      {/* Loading splash */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0b] transition-opacity duration-600">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sites/rifki/asset/logo-r.png"
            alt="Loading"
            className="h-16 w-16 animate-pulse rounded-full object-cover"
          />
          <p className="mt-4 text-sm text-white/60">
            {Object.values(modelProgress).some((p) => p > 0 && p < 100)
              ? "Entering orbit…"
              : "Loading 3D models…"}
          </p>
          <div className="mt-4 h-px w-56 bg-white/15">
            <div
              className="h-full bg-[#ffab00] transition-all"
              style={{
                width: `${Math.round(
                  Object.values(modelProgress).reduce((a, b) => a + b, 0) /
                    experiences.length,
                )}%`,
              }}
            />
          </div>
          <span
            className="mt-2 text-xs"
            style={{ fontFamily: '"Space Mono", monospace' }}
          >
            {Math.round(
              Object.values(modelProgress).reduce((a, b) => a + b, 0) /
                experiences.length,
            )}
            %
          </span>
        </div>
      )}

      {/* Back header */}
      <Link
        href="/"
        className="absolute left-0 top-0 z-40 flex items-center py-5 px-5 lg:px-[5vw]"
      >
        <ChevronLeft size={20} className="text-white" />
        <span className="text-sm text-white"> Back</span>
      </Link>

      {/* Main scrollable section */}
      <div
        ref={sectionRef}
        className="relative w-full bg-[#0b0b0b]"
        style={{ height: `${experiences.length * 100}svh` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* 3D model scene */}
          <ExperienceScene
            modelPath={activeExperience.modelPath}
            onProgress={(p) =>
              setModelProgress((prev) => ({ ...prev, [activeIndex]: p }))
            }
          />

          {/* Left rail — company selector */}
          <div className="absolute left-6 top-1/2 flex -translate-y-1/2 flex-col gap-5 lg:left-[4vw]">
            {experiences.map((exp, i) => (
              <button
                key={exp.id}
                onClick={() => handleCompanyClick(i)}
                className="group flex items-center gap-2"
              >
                <span
                  className={`h-px bg-white/30 transition-all group-hover:w-10 group-hover:bg-white/60 ${
                    activeIndex === i ? "w-10 bg-[#ffab00]" : "w-6"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    activeIndex === i
                      ? "text-white"
                      : "text-white/40 group-hover:text-white/60"
                  }`}
                >
                  {exp.company}
                </span>
              </button>
            ))}
          </div>

          {/* Right card — experience details */}
          <div className="absolute right-6 top-1/2 w-[min(90vw,420px)] -translate-y-1/2 lg:right-[8vw]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExperience.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col gap-3"
              >
                <span
                  className="text-xs uppercase tracking-[0.25em] text-[#ffab00]"
                  style={{ fontFamily: '"Space Mono", monospace' }}
                >
                  MOD-0N
                </span>
                <h3 className="text-3xl font-bold lg:text-4xl">
                  {activeExperience.company}
                </h3>
                <span className="text-sm font-semibold text-[#ffab00]">
                  {activeExperience.role}
                </span>
                <span
                  className="text-sm"
                  style={{ fontFamily: '"Space Mono", monospace' }}
                >
                  {activeExperience.date}
                </span>
                <div
                  className="mt-2 text-sm font-light text-white/75"
                  dangerouslySetInnerHTML={{
                    __html: activeExperience.description,
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export function ExperiencePage() {
  return (
    <SmoothScroll>
      <div className="rifki-page" style={{ maxWidth: "none" }}>
        <ExperienceView />
      </div>
    </SmoothScroll>
  );
}
