# HANDOFF — clone of https://rizal-dev.vercel.app/ (in progress)

Read this first if you are a fresh model/agent. Everything below was measured from the
**production bundle** of the source (no browser was available in this environment, so the
source was reverse-engineered from its Next.js flight payload + webpack chunks; exact
class strings, shader code, animation parameters and copy were read from those files).

Raw evidence kept in this folder:
- `payload.txt` — homepage RSC payload (all content: 20 tech stacks, 2 experiences, 7 projects)
- `exp-payload.txt` — `/experience` RSC payload
- `hero.js` — webpack chunk for the hero section (module 2829)
- `about.js` — webpack chunk for the about section (module 6474)
- `portfolio.js` — webpack chunk for the portfolio section (module 2442)
- `techstack.js` — webpack chunk holding shared/toast code (tech stack scene lives in the page chunk)
- `exp-page.js` — webpack chunk for `/experience` (module 5759)
- the full un-minified-ish JSX/values of the homepage are inside `../` ? no — homepage chunk
  `page-355507cf8c63c1ea.js` was copied nowhere; re-fetch:
  `curl -s https://rizal-dev.vercel.app/_next/static/chunks/app/page-355507cf8c63c1ea.js`
  (that file contains the tech-stack scene, header, footer, loading screen, asteroid geometry).

---

## 1. Route map (source → local)

| Source | Local (this app) | Status |
|---|---|---|
| `/` | `src/app/page.tsx` | **not built yet** |
| `/experience` | `src/app/experience/page.tsx` | **not built yet** |
| `/project/[slug]` (7 slugs) | `src/app/project/[slug]/page.tsx` | **not built yet** — see §6 |

Slugs: `visuwisu-v1`, `cmlabsco`, `iams`, `vanguard`, `caas-visuwisu`, `visuwisu-v2`,
`e-module-smkn-12-malang`.

Only one origin, so no route prefix is needed. The untouched template homepage may be
replaced. Planned ownership (nothing created yet besides assets):

```
src/app/page.tsx                      → thin server component: passes data into <HomeView/>
src/components/sites/rifki/data.ts     → typed content (copy of payload.txt, no runtime fetch)
src/components/sites/rifki/home-view.tsx  → client root: loader, Lenis, socials, header, sections, footer
src/components/sites/rifki/loading-screen.tsx
src/components/sites/rifki/site-header.tsx
src/components/sites/rifki/site-footer.tsx     (starfield canvas + Get In Touch + copyright)
src/components/sites/rifki/social-links.tsx    (fixed mail/github/linkedin column)
src/components/sites/rifki/smooth-scroll.tsx   (lenis wrapper, module 9749)
src/components/sites/rifki/hero.tsx            (three.js astronaut scene + copy)
src/components/sites/rifki/about.tsx           (three.js planet + framer-motion scroll)
src/components/sites/rifki/portfolio.tsx       (terminal card + hover preview + toast)
src/components/sites/rifki/tech-stack.tsx      (three.js asteroids + hover tooltip)
src/components/sites/rifki/experience-view.tsx + src/app/experience/page.tsx
src/components/sites/rifki/project-view.tsx   + src/app/project/[slug]/page.tsx
src/app/rifki.css                              → site-scoped fonts, colors, keyframes, scrollbar
```

## 2. Assets already downloaded → `public/sites/rifki/`

- `asset/logo-icon.png` (256×256 RGBA, PNG) ← `/asset/logo-icon.png`
- `asset/logo.jpeg` (508×508 JPEG) ← `/asset/logo.jpeg`
- `fonts/*.woff2|woff` ← `/_next/static/media/…` (all 9 files, see §3)
- `astro/models/walking-astronaut.glb` (4.0 MB) ← `/astro/source/Walking astronaut.glb`
- `astro/models/cmlabs.glb` (2.7 MB), `sekawan.glb` (487 KB), `gamatecha.glb` (1.1 MB)
- `datocms/*` — **currently 109-byte error pages**, see §7. Do not trust these files.

## 3. Fonts (exact files, use `next/font/local` or @font-face from `/sites/rifki/fonts`)

| Stack | Family | Weight | Files (local name) |
|---|---|---|---|
| body / UI | Geist Sans | 100–900 | `4473ecc91f70f139-s.p.woff` |
| mono accents | Geist Mono | 100–900 | `463dafcda517f24f-s.p.woff` |
| most copy (module 6311) | DM Sans | 100–1000 | `13971731025ec697-s.p.woff2` (latin), `7ab938503e4547a1-s.woff2` (latin-ext) |
| portfolio terminal (module 9961) | Space Mono | 400 | `fc727f226c737876-s.p.woff2` (latin), `ae822095a172cc5c-s.woff2` (latin-ext), `3c70c5716f1730b3-s.woff2` (cyrillic) |
| hero `<h1>` (module 1040) | Covered By Your Grace | 400 | `78bc89dafd10ae87-s.p.woff2` (latin), `ff2fcc32bb54d74c-s.woff2` (latin-ext) |

Source applies the fallback metrics via `size-adjust` overrides (DM Sans 104.53%/94.9%/29.66%,
Space Mono 137.28%/81.58%/26.3%, CBYG 83.24%/116.73%/45.05%) — reuse them for identical wrapping.
Source `body` className: `antialiased bg-main-black min-h-svh w-full` + font vars for Geist.

## 4. Design tokens

`bg-main-black #0B0B0B` · `bg-main-dark #2C2C2C` · `bg-main-orange #FFAB00` ·
`text-main-white #F5F5F5` · `bg-main-white` is the same `#F5F5F5`.
Source uses Tailwind v3.4.17 with these custom colors; template is v4 → add to
`@theme inline` in `src/app/globals.css` (or a site-scoped CSS loaded by the rizal pages):
`--color-main-black:#0b0b0b; --color-main-dark:#2c2c2c; --color-main-orange:#ffab00; --color-main-white:#f5f5f5;`
Extra CSS the source ships (copy into the site stylesheet):
`body{font-family:Arial}`; `.custom-scrollbar` (8px, track `#1f2937`, thumb `#eb5e28`);
`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}} .animate-fadeIn{animation:fadeIn .2s ease-out}`;
`.cursor-none{cursor:none}`; `h-svh/min-h-svh = 100svh`; page shell `max-w-screen-2xl mx-auto`.
Breakpoints in use: `lg` = 1024px, `xl` 1280, `2xl` 1536, `md` 768.

## 5. Page composition (exact values)

Page shell (`page.js`): `min-h-svh h-full w-full min-w-0 max-w-screen-2xl mx-auto bg-main-black relative overflow-x-clip`
inside `<div className={DM_SANS_CLASS}>`. Section order: **Hero → About → Portfolio → TechStack → Footer**, wrapped in `<SmoothScroll>` (Lenis: `lerp .1, smoothWheel true, wheelMultiplier 1, touchMultiplier 1.5`) and `LoadingProvider`.

### Loading screen (`q`) — shown while `!api || !threejs`
`fixed inset-0 z-[100] bg-main-black`; warp-starfield canvas (260 points, speed
`.004 + progress/100*.014`, colors `#ffffff×3 #ffab00 #8bb8ff`, fade fill `rgba(11,11,11,.35)`);
big counter `text-[120px] md:text-[180px] font-bold tabular-nums` (`%` suffix), color
white <33, `text-gray-300` <66, else `text-main-orange`; radial vignette `-inset-x-32 -inset-y-24 -z-10`;
caption `mt-6 text-sm uppercase tracking-[0.3em] text-gray-500`: "Entering warp" / "Destination reached";
bottom row `absolute bottom-8 flex gap-6 text-xs uppercase tracking-wider`: "✓ Fetching Data" and
"✓ Loading 3D Assets" (orange when done, `text-gray-600` when pending). Progress = 50 (api) + 50
(threejs); displayed % steps +2 every 20 ms; at 100 % wait 400 ms → fade 500 ms → unmount.

### Social links (fixed bottom-left, `fixed bottom-5 left-5 lg:left-[5vw] z-40 flex flex-col gap-3`)
Three square round buttons (`h-10 w-10 rounded-full bg-white text-black border-white`,
hover: `bg-gradient-to-tr border-4 border-main-orange`): Mails → `#footer`,
Github → `https://github.com/rzlzrdf` (new tab), Linkedin → `https://www.linkedin.com/in/rizallazu/`.
Icons are lucide-react (Mails, Github, Linkedin) at size 16.

### Header (`sticky top-0 z-50 w-full px-4 lg:px-[5vw] pt-3 lg:pt-4`)
`nav mx-auto max-w-6xl flex justify-between px-4 lg:px-6 py-2.5 rounded-full border backdrop-blur-2xl backdrop-saturate-150`,
shadow `inset_0_1px_0_rgba(255,255,255,.12), inset_0_-1px_0_rgba(255,255,255,.04), 0_8px_32px_rgba(0,0,0,.35)`.
Scrolled (`scrollY > 20`): `bg-main-white/[0.09] border-white/15` else `bg-main-white/[0.04] border-white/10`.
Logo img `/asset/logo-icon.png` `h-8 w-8 lg:h-9 lg:w-9`. Links: Home `#hero`, About `#about-us`,
Portofolio `#portofolio`, Tech Stack `#tech-stack`, Contact `#footer`; `text-sm font-medium px-4 py-1.5 rounded-full`,
active: `text-main-orange bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`, else `text-main-white/80 hover:bg-white/5`.
Scroll-spy: section whose top passes `0.4 * innerHeight`; bottom-most forced on reach page end.
Mobile: `lg:hidden` Menu/X toggle; panel `max-h-0→max-h-96 transition duration-300`, inner
`rounded-3xl border border-white/10 bg-main-black/60 backdrop-blur-2xl`, items `px-4 py-3 text-sm font-medium`.
All anchor clicks `preventDefault` + `scrollIntoView({behavior:'smooth'})`.

### Hero (`#hero`) — chunk `hero.js`
`section.relative.h-[220svh]` → `sticky top-0 h-svh overflow-hidden`; scroll progress
`r = scrollY / (sectionHeight - innerHeight)`.
Three scene: `<Canvas camera={{position:[0,1.1,11],fov:45}} dpr=[1,2] gl={{antialias,alpha,powerPreference:'high-performance'}}>`,
lights: ambient .7, hemisphere `['#ffffff','#101018',.5]`, directional `[4,8,6]` int 3 white,
directional `[-6,2,-4]` int 2 `#FFAB00`. `useGLTF('/astro/source/Walking astronaut.glb', true, gltf => gltf.setMeshoptDecoder(MeshoptDecoder))`.
Model scaled to `(innerWidth<768 ? 1.3 : 2.15) / max(size.x,y,z)`, knees `L_Knee.83`,`R_Knee.89` rotate
around Z by -.5/frame; rotation `y → .35*pointer.x + r*2π`, `x → .08*pointer.y - .35*r`,
`z → -.3 + .05*pointer.x`, y bob `sin(.4*t)*.05`; camera `z = 11` while loading else `3+8*r`, `y = 1.1-.4*r`.
Wave animation ("wave" clip filtered to right-arm bones) loops 3 s out / 1.5 s back, paused until loaded.
Error boundary falls back to calling `setThreeJsLoaded(true)`.
Copy block (`px-4 pb-10 pt-24 lg:pl-[8vw] lg:pt-28`, top gradient overlay `h-72 from-main-black/80`):
badge `rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs lg:text-sm tracking-widest uppercase text-main-white/70` "Full-Stack Web Developer";
`<h1>` Covered By Your Grace `text-5xl lg:text-7xl font-bold` "Hi, I'm **Rizal**!" (name `text-main-orange`);
p `max-w-md text-sm lg:text-base font-light text-main-white/70` "I build immersive web experiences — and right now, I'm floating somewhere out in space.";
p `text-main-orange text-sm lg:text-base font-medium` "I will happy to join with your crew."
Scroll hint `absolute bottom-24 right-6 lg:right-12 flex flex-col items-center gap-1 hover:text-main-orange`: "Scroll to explore" + lucide `ArrowDown` `animate-bounce h-4 w-4`.

### About (`#about-us`) — chunk `about.js`
`section.relative.w-full.h-[220svh].scroll-mt-16.bg-main-black` + sticky viewport.
Canvas (fov 45, camera `[0,0,12]`, `pointer-events:none`): banded planet sphere (custom shader, top `#f8e6b4`, mid `#e0a95c`, bottom `#7a4217`, light dir `(.6,.75,.5)`) inside a rotating tilted group `(0.15,0,0.1)`, plus 8000 additive points ring (radius 1.45–2.30, colors `#fff2c4 → #f3c074 → #5a3a20`, size .07, `pointsMaterial` with canvas sprite) in a group tilted `.9 → .55`.
Scroll-linked: group `x` lerps `0 → -width/2 + .75*t`, `t = .28*min(w,h)`, scale `c = min(.35*min(w,h), .217*width)` → `t`, progress `smoothstep(.02,.85, sectionProgress)`.
Copy `px-[10vw] pb-16 lg:items-center lg:justify-end`, `max-w-xl flex flex-col gap-4`:
`<h2>` `text-2xl lg:text-5xl font-bold` "Introduce"; p `text-sm lg:text-lg font-light text-main-white/80` (Saturn metaphor paragraph — full text in `about.js`);
button → `/experience`: `rounded-full bg-main-orange px-6 py-3 text-sm font-semibold text-main-black hover:scale-105` "My Experience" + lucide `ArrowRight` (size 18).
Motion: framer-motion `useScroll({target, offset:['start start','end end']})`, heading x `120→0`/opacity `0→1` over `[.04,.38]`, body x `140→0`/opacity `0→1` over `[.16,.5]`, shared y `60→-60` over `[0,1]`.

### Portfolio (`#portofolio`) — chunk `portfolio.js`
`section.min-h-[1068px].lg:min-h-svh.relative.px-5.scroll-mt-16`; comet/ember canvas background (80 twinkles, random bursts every 3.6–4.5 s with orange radial glow + sparks, prefers-reduced-motion → static gradient).
Terminal card: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] md:w-3/4 lg:min-h-[70svh] rounded-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.5)]` + `bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.03]` overlay, `#terminal-container`.
Title bar `border-b border-gray-700/60 p-4 max-w-[58%] h-[4svh]` with red/yellow/green dots (`min-w-[10px] lg:min-w-[12px] aspect-square rounded-full`) and `<h2 className="text-sm">My Current Work`.
Body `grid grid-cols-1 lg:grid-cols-5`:
left `lg:col-span-2 p-5`: `/asset/logo.jpeg` `grayscale w-[24%] aspect-square` + Space Mono `text-2xl 2xl:text-4xl` "Rizal Projects" + `Version 1.0, Copyright {year}`.
right `lg:col-span-3 p-5 lg:border-l border-white/10 flex flex-col gap-5 justify-between`: scrollable list (`custom-scrollbar max-h-[calc(100%-60px)]`), each row link → `/project/{slug}` `border-b pb-2 px-2 hover:bg-white hover:text-main-black duration-300`, row head `flex items-start gap-5` with year badge `bg-white text-main-black px-1 mb-2` + name, then `line-clamp-1 text-xs pl-12` description HTML.
Hover preview follows the cursor: `left: x-80, top: y-50`, card `bg-main-black p-2 border-2 border-main-orange rounded-lg shadow-2xl`, image `w-[140px] 2xl:w-[175px]` of `gallery[0]`, bottom gradient caption with project name.
Input row: label "Project", lucide `ChevronRight`, `<input placeholder="example: cmlabs">`; Enter matches `name.toLowerCase()` → `router.push('/project/{slug}')`, otherwise toast `Project with name "X" is not found!` (Radix toast, 1 toast max, 1 s? (1e6) auto-dismiss timer in this build), bottom-right viewport, `text-sm` title.

### Tech Stack (`#tech-stack`) — in the **page chunk**, not `techstack.js`
`section.relative.flex.flex-col.justify-center.min-h-svh.scroll-mt-16.py-16.overflow-hidden`; canvas `relative w-full h-[75svh] lg:h-[85svh]`.
Scene: camera `[0,3.5,16]` fov 45; `ambientLight .3`, `directionalLight [6,8,5] .85`, `pointLight [0,0,0] int 14 dist 40 #8b9cff`; group scaled `min(1, max(.5, width/1100))`, slow `rotation.y += .01*dt`; 20 asteroids placed on a Fibonacci sphere (radius `5.2 ± .7`, y `× .62`, seeded PRNG `t=9301*t+49297 %233280`), each: icosahedron geometry `(1,3)` deformed by 6–10 craters (seeded, radius .22–.52, depth .1–.3) + `canvas 256×128` grey texture, `meshStandardMaterial roughness 1 metalness .05`; drift `sin(t*drift + phase)` ×.28/.22/.28, slow spin; invisible `sphereGeometry(size+.42)` hit area with pointerover/pointerout.
Stars: custom shader points, 1800 particles, radius 80 depth 40, factor 3, fade, speed .6.
Center overlay: `absolute w-[46vmin] h-[46vmin] rounded-full` radial `rgba(11,11,11,0.55)`; `<h2>` `text-4xl lg:text-6xl font-bold` "Tech Stack"; p `text-xs lg:text-sm uppercase tracking-[0.3em] text-main-white/50` "hover an asteroid".
Tooltip on hover: `absolute z-30 pointer-events-none` at `left: min(x+18, w-170)`, `top: y+18`; `flex items-center gap-2.5 bg-main-black/85 backdrop-blur-md border border-main-orange/60 rounded-lg px-3 py-2 shadow-2xl`, icon `w-7 h-7` + `text-sm font-semibold`.
20 items in order: SWR Vercel, Redux Toolkit, Tanstack Query, Socket.io, Vercel, GSAP, Laravel, Three.js, Sanity CMS, PostgreSQL, MySQL, Next JS, Express JS, Nuxt, Dato CMS, Bootstrap, SASS, Tailwind, Typescript, React.

### Footer (`#footer`)
`footer.relative.w-full.h-screen.scroll-mt-16.bg-main-black.overflow-hidden.cursor-none`; warp canvas (180 points, speed `.004`, jumps to `.09` while the mail link is hovered); centered CTA = shadcn `<Button variant="ghost" size="lg">` overridden to
`text-2xl lg:text-5xl font-bold text-main-black bg-main-orange py-20 backdrop-blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40` "Get In Touch " + lucide `ArrowUpRight`; href
`mailto:rizallazu76@gmail.com?subject=I%20wanna%20talk&body=Hello%2C%20i%20found%20your%20website%20and%20i%20wanna%20talk%20to%20you%20about%20...`
Bottom center: `© {currentYear} Rizal. All rights reserved.` (`text-sm lg:text-lg font-light text-main-white/60`).

### `/experience`
Splash (fixed `z-100`, exit fade .6): pulsing `logo-icon.png` `h-16 w-16`, caption "Loading 3D models…"/"Entering orbit…", `h-px w-56 bg-main-white/15` track with `bg-main-orange` width `progress%`, mono `%`.
Header: Back link (lucide `ChevronLeft` + " Back") → `/`, `absolute top-0 z-40 py-5 px-5 lg:px-[5vw]`.
Section `height: 100 * experiences.length svh` + sticky viewport; GLTF scenes from `/cmlabs.glb`, `/sekawan.glb`, `/gamatecha.glb` (MeshoptDecoder, progress bar per model).
Left rail `absolute left-6 top-1/2 -translate-y-1/2 lg:left-[4vw] flex flex-col gap-5`: per-company button = line `h-px w-6 bg-white/30 group-hover:w-10 group-hover:bg-white/60` (active `w-10 bg-main-orange`) + name `text-sm font-medium` (`text-main-white/40` idle).
Right card `absolute right-6 top-1/2 -translate-y-1/2 w-[min(90vw,420px)] lg:right-[8vw]`, AnimatePresence `mode="wait"`, x `40→0→-40`, .45 s: mono `text-xs uppercase tracking-[0.25em] text-main-orange` `MOD-0N`, `<h3>` `text-3xl lg:text-4xl font-bold` company, `text-sm lg:text-base font-semibold text-main-orange` "Frontend Developer", mono date (`cmlabs` → "July 2023 - January 2025", else "Desember 2022 - Juli 2023"), description list `text-sm font-light text-main-white/75` with `list-disc pl-5`.
Scroll maps progress → index (`round(p * (n-1))`); clicking a name does `lenis.scrollTo(top, {duration:1.4})`.

## 6. Known-broken part of the source

`/project/[slug]` **500s on the live site**: the RSC payload ends with `6:E{"digest":"2865802510"}` and
its page chunk was never emitted (`/_next/static/chunks/app/project/%5Bslug%5D/page-*.js` → 404).
Only the **layout** exists client-side: `div.w-full.min-h-svh.bg-main-black.relative` + header with Back link.
Decision: still create `src/app/project/[slug]/page.tsx` (the portfolio list and search box link there),
built as a sensible gallery detail page (Back header + year/name/description + `gallery[]` images),
and disclose that this route diverges from the source because the source errors.

## 7. Blocked: DatoCMS images (right now, on the source too)

All 54 `https://www.datocms-assets.com/146142/...` URLs currently return
`Monthly bandwidth limit exceeded…` (109 bytes) — the *origin account* quota is spent, so the live
site shows broken images too. `public/sites/rifki/datocms/*` currently holds those error pages.
- Keep `scripts/fetch-rifki-assets.sh` retrying `datocms-urls.txt` (kept in this folder) until it
  returns real bytes (verify: SVG starts with `<`, PNG/WebP/JPEG have a magic number).
- Until then: point components at local paths under `/sites/rifki/datocms/<file>` with a
  neutral fallback so the layout can still be compared, and tell the user the images are pending.

## 8. Dependencies to add (template has none of these)

`three`, `@react-three/fiber`, `@react-three/drei` (useGLTF), `framer-motion` (module 166 = `motion.div`,
9993 = `useScroll`/`useTransform`), `lenis` (module 6892 wrapper), plus a GLTF loader +
`MeshoptDecoder` (`three-stdlib` or `three/examples` + `meshoptimizer`).
Toast: shadcn `sonner` or a tiny local toast instead of Radix. Icons: `lucide-react` (already present).

## 9. State of the repo / rules

- Template untouched so far except new folders: `docs/research/rifki/`, `public/sites/rifki/`.
  Nothing under `src/` has been modified; `src/app/page.tsx`, `layout.tsx`, `globals.css` are the
  original template files (read them before editing: layout sets Geist via `next/font/google`,
  globals.css is Tailwind v4 `@theme inline` + oklch tokens).
- No browser/screenshot tooling was available in this session, so **§4 comparison (visual diffing)
  has not been performed**. Once a browser exists: capture source vs local at 1440×900 and 390×844
  at scroll 0 / hero mid-scroll / about mid-scroll / portfolio / tech stack / footer, plus the mobile menu
  and the loading screen, then fix drift.
- Run `npm run check` (lint + typecheck + build) before calling it done. Downloaded `.glb`/fonts
  belong in `public/`, not in `src/`.