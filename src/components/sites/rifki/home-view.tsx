"use client";

import { LoadingProvider } from "./loading-provider";
import { LoadingScreen } from "./loading-screen";
import { SmoothScroll } from "./smooth-scroll";
import { SocialLinks } from "./social-links";
import { SiteHeader } from "./site-header";
import { Hero } from "./hero";
import { About } from "./about";
import { Portfolio } from "./portfolio";
import { TechStack } from "./tech-stack";
import { SiteFooter } from "./site-footer";

export function HomeView() {
  return (
    <LoadingProvider>
      <LoadingScreen />
      <SmoothScroll>
        <div className="rifki-page">
          <SiteHeader />
          <SocialLinks />
          <main>
            <Hero />
            <About />
            <Portfolio />
            <TechStack />
            <SiteFooter />
          </main>
        </div>
      </SmoothScroll>
    </LoadingProvider>
  );
}
