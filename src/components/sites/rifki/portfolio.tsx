"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { projects } from "./data";

// Simple toast state
type Toast = { id: number; message: string };
let toastId = 0;

function CometCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced) {
      // Static gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      grad.addColorStop(0, "rgba(11,11,11,1)");
      grad.addColorStop(0.5, "rgba(20,15,10,1)");
      grad.addColorStop(1, "rgba(11,11,11,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      return () => window.removeEventListener("resize", resize);
    }

    type Star = { x: number; y: number; size: number; twinkle: number; phase: number };
    type Comet = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

    const stars: Star[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    const comets: Comet[] = [];

    let lastComet = 0;
    let animFrame = 0;

    const animate = (t: number) => {
      ctx.fillStyle = "rgba(11, 11, 11, 0.15)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Twinkle stars
      for (const star of stars) {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.001 * star.twinkle + star.phase));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn comets
      if (t - lastComet > 3600 + Math.random() * 900) {
        lastComet = t;
        const fromLeft = Math.random() > 0.5;
        comets.push({
          x: fromLeft ? -50 : canvas.offsetWidth + 50,
          y: Math.random() * canvas.offsetHeight,
          vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 2),
          vy: (Math.random() - 0.5) * 2,
          life: 0,
          maxLife: 200 + Math.random() * 100,
        });
      }

      // Update comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx;
        c.y += c.vy;
        c.life++;

        const alpha = Math.sin((c.life / c.maxLife) * Math.PI);

        // Glow
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 40);
        grad.addColorStop(0, `rgba(255, 171, 0, ${alpha * 0.6})`);
        grad.addColorStop(0.3, `rgba(255, 100, 0, ${alpha * 0.3})`);
        grad.addColorStop(1, "rgba(255, 171, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(c.x - 40, c.y - 40, 80, 80);

        // Sparks
        ctx.fillStyle = `rgba(255, 230, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = `rgba(255, 171, 0, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 8, c.y - c.vy * 8);
        ctx.stroke();

        if (c.life >= c.maxLife) {
          comets.splice(i, 1);
        }
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
    />
  );
}

function HoverPreview({ project }: { project: (typeof projects)[0] | null }) {
  if (!project) return null;
  return (
    <div className="pointer-events-none fixed z-30 border-2 border-[#ffab00] rounded-lg bg-[#0b0b0b] p-2 shadow-2xl"
      style={{ display: "none" }}
      id="hover-preview"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.gallery[0]}
        alt={project.name}
        className="w-[140px] 2xl:w-[175px]"
      />
      <div className="mt-1 bg-gradient-to-t from-[#0b0b0b] to-transparent p-1 text-xs text-white">
        {project.name}
      </div>
    </div>
  );
}

export function Portfolio() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hoveredProject, setHoveredProject] = useState<(typeof projects)[0] | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Hover preview follows cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!previewRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      previewRef.current.style.display = hoveredProject ? "block" : "none";
      previewRef.current.style.left = `${Math.min(x + 18, window.innerWidth - 170)}px`;
      previewRef.current.style.top = `${y + 18}px`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hoveredProject]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const query = inputValue.trim().toLowerCase();
    if (!query) return;
    const found = projects.find((p) => p.name.toLowerCase() === query);
    if (found) {
      router.push(`/project/${found.slug}`);
    } else {
      const id = ++toastId;
      setToasts([{ id, message: `Project with name "${inputValue}" is not found!` }]);
    }
  };

  return (
    <section
      id="portofolio"
      className="relative min-h-[1068px] scroll-mt-16 px-5 lg:min-h-svh"
    >
      {/* Comet background */}
      <CometCanvas />

      {/* Terminal card */}
      <div className="absolute left-1/2 top-1/2 w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/[0.05] p-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:w-3/4 lg:min-h-[70svh]">
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.03]" />

        {/* Title bar */}
        <div className="flex items-center border-b border-gray-700/60 p-4" style={{ maxWidth: "58%", height: "4svh" }}>
          <div className="flex gap-2">
            <span className="min-w-[10px] aspect-square rounded-full bg-red-500 lg:min-w-[12px]" />
            <span className="min-w-[10px] aspect-square rounded-full bg-yellow-500 lg:min-w-[12px]" />
            <span className="min-w-[10px] aspect-square rounded-full bg-green-500 lg:min-w-[12px]" />
          </div>
          <h2 className="ml-4 text-sm">My Portofolio</h2>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left side */}
          <div className="p-5 lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sites/rifki/asset/logo.jpeg"
              alt="Rifki"
              className="aspect-square w-[24%] grayscale"
            />
            <h2
              className="mt-4 text-2xl 2xl:text-4xl"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              Rifki Projects
            </h2>
            <p
              className="mt-1 text-xs text-[#f5f5f5]/50"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              Version 1.0, Copyright {new Date().getFullYear()}
            </p>
          </div>

          {/* Right side */}
          <div className="flex flex-col gap-5 border-white/10 p-5 lg:col-span-3 lg:border-l">
            {/* Scrollable project list */}
            <div className="custom-scrollbar max-h-[calc(100%-60px)] overflow-y-auto">
              {projects.map((project) => (
                <a
                  key={project.id}
                  href={`/project/${project.slug}`}
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="block border-b border-white/10 px-2 pb-2 transition-colors duration-300 hover:bg-white hover:text-[#0b0b0b]"
                >
                  <div className="flex items-start gap-5">
                    <span className="mb-2 bg-white px-1 text-[#0b0b0b]">
                      {project.year}
                    </span>
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <p
                    className="line-clamp-1 pl-12 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: project.description.replace(/<[^>]*>/g, " ").trim(),
                    }}
                  />
                </a>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-3">
            <span className="text-sm text-[#f5f5f5]/60">Project</span>
            <ChevronRight size={16} className="text-[#f5f5f5]/40" />
            <input
                type="text"
                placeholder="example: cmlabs"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#f5f5f5]/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hover preview (follows cursor) */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed z-30 hidden border-2 border-[#ffab00] rounded-lg bg-[#0b0b0b] p-2 shadow-2xl"
      >
        {hoveredProject && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hoveredProject.gallery[0]}
              alt={hoveredProject.name}
              className="w-[140px] 2xl:w-[175px]"
            />
            <div className="mt-1 bg-gradient-to-t from-[#0b0b0b] to-transparent p-1 text-xs text-white">
              {hoveredProject.name}
            </div>
          </>
        )}
      </div>

      {/* Hidden component for type safety */}
      <div className="hidden">
        <HoverPreview project={hoveredProject} />
      </div>

      {/* Toast */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fadeIn rounded-lg border border-[#ffab00]/60 bg-[#0b0b0b]/90 px-4 py-3 text-sm backdrop-blur-md"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  );
}
