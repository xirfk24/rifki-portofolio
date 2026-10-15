# Rifki - Web Developer Portfolio

Personal portfolio showcasing my work as a full-stack web developer, selected projects, experience, and technology stack.

The site pairs a dark visual style with an animated 3D astronaut, scroll-driven transitions, and project pages.

## Features

- Responsive portfolio with Home, About, Portfolio, Tech Stack, and Contact sections
- Interactive 3D astronaut and planet scenes built with Three.js and React Three Fiber
- Scroll-based motion and smooth scrolling
- Project detail pages and a dedicated experience page
- Contact links for email, GitHub, and LinkedIn

## Tech Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Three.js and React Three Fiber
- Framer Motion and Lenis
- Docker with Next.js standalone output

## Getting Started

Requirements: Node.js 24 or newer and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

The production server listens on port `3000` by default.

## Deploy with Docker Compose

Build and start only the production service:

```bash
docker compose up -d --build app
```

View logs or stop the service:

```bash
docker compose logs -f app
docker compose down
```

The app is available on port `3000` by default. Set `PORT` in the environment to use a different host port.

## Useful Commands

```bash
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript
npm run check      # Run lint, typecheck, and production build
```

## Project Structure

```text
src/
  app/                       # Home, experience, and project routes
  components/sites/rifki/     # Portfolio sections and shared site components
  components/ui/              # Reusable UI components
public/
  sites/rifki/                # Images, fonts, and 3D models
```

## Contact

- GitHub: [xirfk24](https://github.com/xirfk24)
- LinkedIn: [rifki](https://www.linkedin.com/in/xirfk/)
- Email: [rsanusi24@gmail.com](mailto:rsanusi24@gmail.com)
