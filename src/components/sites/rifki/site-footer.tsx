"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { contactMailto } from "./data";

// Simple lerp
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function WarpCanvas({ speedUp }: { speedUp: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    type Star = { x: number; y: number; z: number; color: string };
    const colors = ["#ffffff", "#f7e7b8", "#fff8d1", "#ffab00", "#8bb8ff", "#d7e6ff"];
    const count = 420;
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * w(),
      y: (Math.random() - 0.5) * h(),
      z: Math.random() * w(),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let currentSpeed = 0.004;
    let animFrame = 0;

    const animate = () => {
      const targetSpeed = speedUp ? 0.09 : 0.004;
      currentSpeed = lerp(currentSpeed, targetSpeed, 0.05);

      ctx.fillStyle = "rgba(11, 11, 11, 0.35)";
      ctx.fillRect(0, 0, w(), h());

      const cx = w() / 2;
      const cy = h() / 2;

      for (const star of stars) {
        star.z -= currentSpeed * w();
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w();
          star.y = (Math.random() - 0.5) * h();
          star.z = w();
        }

        const sx = (star.x / star.z) * w() + cx;
        const sy = (star.y / star.z) * w() + cy;

        if (sx < 0 || sx > w() || sy < 0 || sy > h()) continue;

        const size = (1 - star.z / w()) * 2;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, [speedUp]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
    />
  );
}

export function SiteFooter() {
  const [hovering, setHovering] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="relative h-screen w-full scroll-mt-16 overflow-hidden bg-[#0b0b0b]"
      style={{ cursor: hovering ? "none" : "default" }}
    >
      <WarpCanvas speedUp={hovering} />

      {/* CTA Button */}
      <a
        href={contactMailto}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-[#ffab00] px-12 py-20 text-2xl font-bold text-[#0b0b0b] backdrop-blur-2xl transition-transform hover:scale-105 lg:text-5xl"
      >
        Get In Touch{" "}
        <ArrowUpRight size={hovering ? 48 : 36} className="transition-all" />
      </a>

      {/* Copyright */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8">
        <p className="text-sm font-light text-[#f5f5f5]/60 lg:text-lg">
          © {year} Rifki. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
