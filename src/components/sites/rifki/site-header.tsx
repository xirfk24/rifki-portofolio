"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "./data";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll detection + scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Scroll-spy: section whose top passes 0.4 * innerHeight
      const threshold = 0.4 * window.innerHeight;
      const sections = navLinks.map((link) => {
        const el = document.querySelector(link.href);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { href: link.href, top: rect.top };
      });

      // Find the last section whose top is above threshold
      let current = navLinks[0]?.href ?? "#hero";
      for (const s of sections) {
        if (s && s.top <= threshold) {
          current = s.href;
        }
      }

      // Force bottom section on reach page end
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 2
      ) {
        current = "#footer";
      }

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 lg:px-[5vw] lg:pt-4">
      <nav
        className={`mx-auto flex max-w-6xl justify-between rounded-full border px-4 py-2.5 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 lg:px-6 ${
          scrolled
            ? "border-white/15 bg-[#f5f5f5]/[0.09]"
            : "border-white/10 bg-[#f5f5f5]/[0.04]"
        }`}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon-r-v2.svg"
            alt="Rifki"
            className="h-8 w-8 rounded-xl bg-[#111318] object-cover p-1 lg:h-9 lg:w-9"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeSection === link.href
                  ? "bg-white/10 text-[#ffab00] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-[#f5f5f5]/80 hover:bg-white/5"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center justify-center text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`mx-auto max-w-6xl overflow-hidden transition-all duration-300 lg:hidden ${
          mobileOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="mt-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/60 p-2 backdrop-blur-2xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === link.href
                  ? "text-[#ffab00]"
                  : "text-[#f5f5f5]/80 hover:bg-white/5"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
