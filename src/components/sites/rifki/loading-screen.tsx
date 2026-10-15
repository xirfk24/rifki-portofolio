"use client";

import { useEffect, useRef, useState } from "react";
import { useLoading } from "./loading-provider";

/**
 * Warp starfield loading screen.
 * Canvas with streaking stars, big percentage counter, and status indicators.
 * Progress = 50 (api) + 50 (threejs).
 */
export function LoadingScreen() {
  const { isLoading, setIsLoading, progress } = useLoading();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<
    { x: number; y: number; z: number; color: string; speed: number }[]
  >([]);

  // Build starfield once
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#ffffff", "#ffffff", "#ffffff", "#ffab00", "#8bb8ff"];
    const count = 260;
    starsRef.current = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * canvas.width,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0,
    }));
  }, []);

  // Animate starfield
  useEffect(() => {
    if (!canvasRef.current || !isLoading) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    const w = window.innerWidth;
    const h = window.innerHeight;

    const stars = starsRef.current;
    if (stars.length === 0) {
      const colors = ["#ffffff", "#ffffff", "#ffffff", "#ffab00", "#8bb8ff"];
      stars.length = 260;
      for (let i = 0; i < 260; i++) {
        stars[i] = {
          x: (Math.random() - 0.5) * w,
          y: (Math.random() - 0.5) * h,
          z: Math.random() * w,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: 0,
        };
      }
    }

    let lastProgress = 0;
    const animate = () => {
      lastProgress = progress;
      const speed = 0.004 + (lastProgress / 100) * 0.014;

      // Fade trail
      ctx.fillStyle = "rgba(11, 11, 11, 0.35)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const star of stars) {
        star.z -= speed * w;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w;
          star.y = (Math.random() - 0.5) * h;
          star.z = w;
        }

        const sx = (star.x / star.z) * w + cx;
        const sy = (star.y / star.z) * w + cy;

        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

        const size = (1 - star.z / w) * 2;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isLoading, progress]);

  // Animate displayed counter from 0 to progress, +2 every 20ms
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev >= progress) return prev;
        return Math.min(prev + 2, progress);
      });
    }, 20);
    return () => clearInterval(interval);
  }, [isLoading, progress]);

  // When displayPercent reaches 100, wait 400ms then fade out 500ms then unmount
  useEffect(() => {
    if (displayPercent >= 100) {
      const t1 = setTimeout(() => {
        setOpacity(0);
      }, 400);
      const t2 = setTimeout(() => {
        setIsLoading(false);
      }, 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [displayPercent, setIsLoading]);

  if (!isLoading) return null;

  const counterColor =
    displayPercent < 33
      ? "text-white"
      : displayPercent < 66
        ? "text-gray-300"
        : "text-[#ffab00]";

  const caption = displayPercent < 100 ? "Entering warp" : "Destination reached";

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0b0b0b] transition-opacity duration-500"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Radial vignette */}
      <div
        className="absolute -inset-x-32 -inset-y-24 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(11,11,11,0.8) 100%)",
        }}
      />

      {/* Counter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`text-[120px] font-bold tabular-nums leading-none md:text-[180px] ${counterColor}`}
        >
          {displayPercent}
          <span className="text-[0.5em]">%</span>
        </div>
        <div className="mt-6 text-sm uppercase tracking-[0.3em] text-gray-500">
          {caption}
        </div>
      </div>

      {/* Bottom status row */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-6 whitespace-nowrap text-xs uppercase tracking-wider">
        <span className="text-[#ffab00]">&#10003; Fetching Data</span>
        <span
          className={
            displayPercent >= 50 ? "text-[#ffab00]" : "text-gray-600"
          }
        >
          &#10003; Loading 3D Assets
        </span>
      </div>
    </div>
  );
}
