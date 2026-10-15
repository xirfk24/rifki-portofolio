// All content extracted from the source RSC payload — typed, no runtime fetch.

export type TechStackItem = {
  id: string;
  name: string;
  icon: string; // local path under /sites/rifki/datocms/
};

export type Experience = {
  id: string;
  company: string;
  image: string;
  description: string;
  role: string;
  date: string;
  modelPath: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  gallery: string[];
  description: string;
  year: number;
};

// Helper: map DatoCMS URL to local path (fallback if DatoCMS is bandwidth-limited)
const datoLocal = (filename: string) => `/sites/rifki/datocms/${filename}`;

export const techStack: TechStackItem[] = [
  { id: "HI4wyMWDQ8eaZHnb1PFzIg", name: "SWR Vercel", icon: datoLocal("1755598672-swr.png") },
  { id: "QV_BlJCATa-jCD-SEwUDww", name: "Redux Toolkit", icon: datoLocal("1755598558-redux.png") },
  { id: "H3KqOfnvR5mhh8bV5ii_Rg", name: "Tanstack Query", icon: datoLocal("1755598502-ts.png") },
  { id: "A1nL9WoFS-S9ut1khDf8HQ", name: "Socket.io", icon: datoLocal("1735132089-socket-io.svg") },
  { id: "WiM9PbKRQ4iZHlY3F2GFvQ", name: "Vercel", icon: datoLocal("1735045238-vercel.svg") },
  { id: "dVPogZbHSaqfJGmBYrtbDQ", name: "GSAP", icon: datoLocal("1735045211-gsap-greensock.svg") },
  { id: "blc8YAI9TM2nb9TL1tUwaQ", name: "Laravel", icon: datoLocal("1734940894-laravel-2.svg") },
  { id: "MARPa0tvQsezLR3_jVW5Vw", name: "Three.js", icon: datoLocal("1734940866-threejs-1.svg") },
  { id: "f6iKvQc2TDa_vmfO6BuQNA", name: "Sanity CMS", icon: datoLocal("1734940831-sanity.svg") },
  { id: "C7FZPNLJTDmMeHQbNKhQLg", name: "PostgreSQL", icon: datoLocal("1734940791-postgresql.svg") },
  { id: "OCJ3lxcsQFy6KdQQUVMMpw", name: "MySQL", icon: datoLocal("1734940735-mysql-logo-pure.svg") },
  { id: "VYSxWlLkRB-YMzhzuYaqJQ", name: "Next JS", icon: datoLocal("1734931389-next-js.svg") },
  { id: "OLE_qwijRoG91K6UoCO08Q", name: "Express JS", icon: datoLocal("1734940675-express-109.svg") },
  { id: "fr5rblSBSdiv_pnkHoYyGQ", name: "Nuxt", icon: datoLocal("1734940647-nuxt-2.svg") },
  { id: "Nj3kwQX5TEaLgF-fnGG1MQ", name: "Dato CMS", icon: datoLocal("1734939257-datocms-1.svg") },
  { id: "PBxHdltMRLyCHECFQ11FhQ", name: "Bootstrap", icon: datoLocal("1734932103-bootstrap-5-1.svg") },
  { id: "EGi2ebbdRAyNweEIFaWIzw", name: "SASS", icon: datoLocal("1734931503-sass-1.svg") },
  { id: "GMV8ICmmQy6O2gxENpe8DA", name: "Tailwind", icon: datoLocal("1734931478-tailwind-css-2.svg") },
  { id: "O-1hbXdOSzS4TKiZv74ufA", name: "Typescript", icon: datoLocal("1734931411-typescript.svg") },
  { id: "YU0s1TDUTry_kRJ4knPDeg", name: "React", icon: datoLocal("1734931366-react.svg") },
];

export const experiences: Experience[] = [
  {
    id: "L8jQxCNuT06FG-n5a4bX1w",
    company: "cmlabs",
    image: datoLocal("1734945247-cmlabs.png"),
    role: "Frontend Developer",
    date: "July 2023 - January 2025",
    modelPath: "/sites/rifki/astro/models/cmlabs.glb",
    description: `<ul>
<li>Implement new feature and maintain system with SEO On Page Rules - Integrate with with REST and GraphQL protocols</li>
<li>Create motion and animation interaction with GSAP</li>
<li>Team collaboration with SCRUM working method</li>
<li>Maintaining company website infrastructure with Laravel Tech</li>
<li>Maintaining and Integrating with NextJS and GraphQL protocols</li>
<li>Page 1 of 2 * Build Web App (CaaS) in Frontand and Backend with MERN + Postgres Stack</li>
<li>Create scalabale and maintainable API with Express TS, Postgres, and MongoDB</li>
<li>Build Realtime data transfer web app feature with Web Socket</li>
<li>Create interacvtive motion web design with GSAP Javascript Library</li>
</ul>`,
  },
  {
    id: "NUG68lJUQxm7B2s-VZxF0Q",
    company: "Sekawan Media",
    image: datoLocal("1734945012-sekawanmedia_logo.jpeg"),
    role: "Frontend Developer",
    date: "Desember 2022 - Juli 2023",
    modelPath: "/sites/rifki/astro/models/sekawan.glb",
    description: `<p></p>
<ul>
<li>Implement and Integrate features with the SCRUM method</li>
<li>Write code clean and structured in accordance with the blueprint documentation and Lead Engineer instruction</li>
<li>Debugging/bug fixes</li>
<li>Provide input ideas and suggestions for the project</li>
</ul>`,
  },
];

export const projects: Project[] = [
  {
    id: "No8vnqm8Qm6tl_UW_z4fEg",
    slug: "caas-visuwisu",
    name: "xirfk24.github.io",
    gallery: [
      datoLocal("1735188781-macbook-air-staging-app-visuwisu-co.png"),
      datoLocal("1735188781-macbook-air-staging-app-visuwisu-co-1.png"),
      datoLocal("1735188781-macbook-air-staging-app-visuwisu-co-2.png"),
      datoLocal("1735188930-macbook-air-staging-app-visuwisu-co-3.png"),
      datoLocal("1735189027-macbook-air-staging-app-visuwisu-co-4.png"),
      datoLocal("1735189118-macbook-air-staging-app-visuwisu-co-5.png"),
    ],
    description: `<p>Personal GitHub Pages portfolio that acts as my public profile and landing space for experiments, projects, and profile highlights.</p>
<p>The focus is on a clean presentation of work, quick navigation, and making technical projects easy to discover and understand.</p>`,
    year: 2021,
  },
  {
    id: "Q8pubGdYQAmvlJBMLdlexA",
    slug: "iams",
    name: "Kamera Kami",
    gallery: [
      datoLocal("1735137040-iams4.webp"),
      datoLocal("1735137040-iams3.webp"),
      datoLocal("1735137039-iams.webp"),
      datoLocal("1735137039-iams2.webp"),
    ],
    description: `<p>Product-focused project centered on a camera and photography-oriented landing experience, balancing clean design with clear conversion flow.</p>
<p>This kind of work highlights my approach to UI structure, responsiveness, and content organization for customer-facing digital products.</p>`,
    year: 2025,
  },
  {
    id: "Jl_RiHCgQ3aivuOJCDA1WA",
    slug: "cmlabsco",
    name: "Undangan Ikylini",
    gallery: [
      datoLocal("1735187236-macbook-air-cmlabs-co.png"),
      datoLocal("1735187251-macbook-air-cmlabs-co-3.png"),
      datoLocal("1735187251-macbook-air-cmlabs-co-1.png"),
      datoLocal("1735187251-macbook-air-cmlabs-co-6.png"),
      datoLocal("1735187250-macbook-air-cmlabs-co-4.png"),
    ],
    description: `<p>Wedding invitation website built to deliver a modern and personal digital experience for an event, with responsive layouts and polished interaction details.</p>
<p>The project focuses on elegant UI, clear content structure, and smooth user experience for guests accessing the invitation on desktop or mobile.</p>`,
    year: 2025,
  },
  {
    id: "NsiKpFdJR5mQ5rQZa_4Z3A",
    slug: "visuwisu-v1",
    name: "PLN Content Generator",
    gallery: [
      datoLocal("1735136781-vw3.png"),
      datoLocal("1735136781-vw.png"),
      datoLocal("1735136781-vw2.png"),
    ],
    description: `<p>Tool for generating PLN-related content and campaign assets with a faster workflow for repetitive publishing tasks.</p>
<p>This project reflects my interest in practical automation, reusable templates, and developer-friendly utilities that help teams save time without sacrificing quality.</p>`,
    year: 2026,
  },
  {
    id: "bTY2BrE4SROdGgV0W5BnLQ",
    slug: "vanguard",
    name: "0xFiveM Bot Finder",
    gallery: [
      datoLocal("1735136567-vg6.png"),
      datoLocal("1735136567-vg4.png"),
      datoLocal("1735136567-vg2.png"),
      datoLocal("1735136568-vg3.png"),
      datoLocal("1735136568-vg5.png"),
    ],
    description: `<p>Utility project for searching, identifying, and checking FiveM-related bot/server patterns with a practical tool-focused workflow.</p>
<p>It showcases my interest in automation, scripting, and building small but useful developer tools that solve real operational problems.</p>`,
    year: 2026,
  },
  {
    id: "obesiunjani-1",
    slug: "obesiunjani",
    name: "SIMPRO-OBE",
    gallery: ["/sites/rifki/obesiunjani/obesi.png"],
    description: `<p>SIMPRO-OBE is an academic management platform for the Faculty of Science and Informatics at Universitas Jenderal Achmad Yani. It supports Outcome-Based Education (OBE) curriculum planning and helps connect graduate profiles, learning outcomes (CPL), course materials, and courses.</p>
  <p>The platform brings curriculum management, CPL achievement reporting, accreditation and quality-assurance workflows, and role-specific dashboards into one system for administrators, program leaders, lecturers, and students. Built with React, TypeScript, and Supabase.</p>`,
    year: 2026,
  },
];

// Contact email
export const contactMailto =
  "mailto:rsanusi24@gmail.com?subject=I%20wanna%20talk&body=Hello%2C%20i%20found%20your%20website%20and%20i%20wanna%20talk%20to%20you%20about%20...";

// Social links
export const socialLinks = [
  {
    label: "Mail",
    href: contactMailto,
    icon: "mails" as const,
  },
  {
    label: "Github",
    href: "https://github.com/xirfk24",
    icon: "github" as const,
    external: true,
  },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/in/xirfk/",
    icon: "linkedin" as const,
    external: true,
  },
];

// Nav links
export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about-us" },
  { label: "Portfolio", href: "#portofolio" },
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Contact", href: "#footer" },
];

