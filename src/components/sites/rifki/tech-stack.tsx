"use client";

import { useRef, useMemo, useState, Suspense, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { techStack } from "./data";

// Seeded PRNG (matches source: t = 9301 * t + 49297 % 233280)
function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (9301 * t + 49297) % 233280;
    return t / 233280;
  };
}

type AsteroidData = {
  position: [number, number, number];
  craters: { position: [number, number, number]; radius: number; depth: number }[];
  driftSpeed: number;
  driftPhase: number;
  spinSpeed: [number, number, number];
  baseRotation: [number, number, number];
  texture: THREE.Texture;
};

// Generate grey noise texture for asteroids
function createAsteroidTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 256; x++) {
      const grey = 60 + Math.random() * 80;
      ctx.fillStyle = `rgb(${grey},${grey},${grey})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function createAsteroidGeometry(
  radius: number,
  detail: number,
  craters: { position: [number, number, number]; radius: number; depth: number }[],
) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const positions = geo.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const vertex = new THREE.Vector3(
      positions.getX(i),
      positions.getY(i),
      positions.getZ(i),
    );
    let displacement = 0;

    for (const crater of craters) {
      const craterPos = new THREE.Vector3(...crater.position);
      const dist = vertex.distanceTo(craterPos);
      if (dist < crater.radius) {
        displacement -= crater.depth * (1 - dist / crater.radius);
      }
    }

    displacement += (Math.random() - 0.5) * 0.05;
    vertex.add(vertex.clone().normalize().multiplyScalar(displacement));
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Star field shader
const starVertexShader = `
attribute float size;
attribute float aColor;
varying float vColor;
uniform float time;
uniform float pixelRatio;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
  vColor = aColor;
}
`;

const starFragmentShader = `
varying float vColor;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(vColor), alpha * 0.8);
}
`;

function StarField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [data, setData] = useState<{
    positions: Float32Array;
    sizes: Float32Array;
    colors: Float32Array;
    uniforms: { time: { value: number }; pixelRatio: { value: number } };
  } | null>(null);

  useEffect(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count);
    const radius = 80;
    const depth = 40;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * depth;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 1 + Math.random() * 2;
      colors[i] = 0.5 + Math.random() * 0.5;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({
      positions,
      sizes,
      colors,
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
    });
  }, []);

  useFrame((state) => {
    if (matRef.current) {
      (matRef.current.uniforms.time as { value: number }).value =
        state.clock.getElapsedTime();
    }
  });

  return (
    <points>
      {data && (
        <>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            <bufferAttribute attach="attributes-size" args={[data.sizes, 1]} />
            <bufferAttribute attach="attributes-aColor" args={[data.colors, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={matRef}
            vertexShader={starVertexShader}
            fragmentShader={starFragmentShader}
            uniforms={data.uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </>
      )}
    </points>
  );
}

function Asteroid({
  data,
  index,
  onHover,
}: {
  data: AsteroidData;
  index: number;
  onHover: (index: number | null, x?: number, y?: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hitRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(
    () => createAsteroidGeometry(1, 3, data.craters),
    [data.craters],
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    meshRef.current.position.x = data.position[0] + Math.sin(t * data.driftSpeed + data.driftPhase) * 0.28;
    meshRef.current.position.y = data.position[1] + Math.cos(t * data.driftSpeed + data.driftPhase) * 0.22;
    meshRef.current.position.z = data.position[2] + Math.sin(t * data.driftSpeed * 0.7 + data.driftPhase) * 0.28;
    meshRef.current.rotation.x += data.spinSpeed[0] * delta;
    meshRef.current.rotation.y += data.spinSpeed[1] * delta;
    meshRef.current.rotation.z += data.spinSpeed[2] * delta;

    if (hitRef.current) {
      hitRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <>
      <mesh
        ref={meshRef}
        position={data.position}
        rotation={data.baseRotation}
        geometry={geometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(index, e.clientX, e.clientY);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <meshStandardMaterial roughness={1} metalness={0.05} map={data.texture} />
      </mesh>
      <mesh
        ref={hitRef}
        position={data.position}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(index, e.clientX, e.clientY);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <sphereGeometry args={[1.42, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

function AsteroidField({
  onHover,
}: {
  onHover: (index: number | null, x?: number, y?: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);

  // Generate asteroids on mount
  useEffect(() => {
    const rng = seededRandom(42);
    const texture = createAsteroidTexture();
    const arr: AsteroidData[] = [];

    for (let i = 0; i < 20; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 20);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 5.2 + (rng() - 0.5) * 1.4;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      const z = radius * Math.cos(phi);

      const craterCount = 6 + Math.floor(rng() * 5);
      const craters: AsteroidData["craters"] = [];
      for (let c = 0; c < craterCount; c++) {
        const cphi = Math.acos(rng() * 2 - 1);
        const ctheta = rng() * Math.PI * 2;
        const craterRadius = 0.22 + rng() * 0.3;
        craters.push({
          position: [
            Math.sin(cphi) * Math.cos(ctheta),
            Math.sin(cphi) * Math.sin(ctheta),
            Math.cos(cphi),
          ],
          radius: craterRadius,
          depth: 0.1 + rng() * 0.2,
        });
      }

      arr.push({
        position: [x, y, z],
        craters,
        driftSpeed: 0.2 + rng() * 0.3,
        driftPhase: rng() * Math.PI * 2,
        spinSpeed: [
          (rng() - 0.5) * 0.2,
          (rng() - 0.5) * 0.2,
          (rng() - 0.5) * 0.2,
        ],
        baseRotation: [rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2],
        texture,
      });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAsteroids(arr);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const scale = Math.min(1, Math.max(0.5, size.width / 1100));
    groupRef.current.scale.setScalar(scale);
    groupRef.current.rotation.y += 0.01 * delta;
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((data, i) => (
        <Asteroid key={i} data={data} index={i} onHover={onHover} />
      ))}
    </group>
  );
}

function TechStackScene({
  onHover,
}: {
  onHover: (index: number | null, x?: number, y?: number) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 3.5, 16], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 8, 5]} intensity={0.85} />
      <pointLight position={[0, 0, 0]} intensity={14} distance={40} color="#8b9cff" />
      <Suspense fallback={null}>
        <AsteroidField onHover={onHover} />
        <StarField />
      </Suspense>
    </Canvas>
  );
}

export function TechStack() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(800);

  const handleHover = useCallback(
    (index: number | null, x?: number, y?: number) => {
      setHoveredIndex(index);
      if (x !== undefined && y !== undefined) {
        setTooltipPos({ x, y });
      }
    },
    [],
  );

  // Track container width for tooltip clamping
  useEffect(() => {
    const updateWidth = () => {
      const el = document.getElementById("tech-stack-canvas-container");
      if (el) setContainerWidth(el.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Update tooltip position on mouse move when hovering
  useEffect(() => {
    if (hoveredIndex === null) return;
    const handleMove = (e: MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [hoveredIndex]);

  const hoveredItem =
    hoveredIndex !== null ? techStack[hoveredIndex] : null;

  return (
    <section
      id="tech-stack"
      className="relative flex min-h-svh scroll-mt-16 flex-col justify-center overflow-hidden py-16"
    >
      {/* Canvas */}
      <div
        id="tech-stack-canvas-container"
        className="relative h-[75svh] w-full lg:h-[85svh]"
      >
        <TechStackScene onHover={handleHover} />

        {/* Center overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="flex h-[46vmin] w-[46vmin] items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(11,11,11,0.55) 0%, transparent 70%)",
            }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold lg:text-6xl">Tech Stack</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#f5f5f5]/50 lg:text-sm">
                hover an asteroid
              </p>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredItem && (
          <div
            className="pointer-events-none absolute z-30 flex items-center gap-2.5 rounded-lg border border-[#ffab00]/60 bg-[#0b0b0b]/85 px-3 py-2 shadow-2xl backdrop-blur-md"
            style={{
              left: Math.min(tooltipPos.x + 18, containerWidth - 170),
              top: tooltipPos.y + 18,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hoveredItem.icon}
              alt={hoveredItem.name}
              className="h-7 w-7"
            />
            <span className="text-sm font-semibold">{hoveredItem.name}</span>
          </div>
        )}
      </div>
    </section>
  );
}
