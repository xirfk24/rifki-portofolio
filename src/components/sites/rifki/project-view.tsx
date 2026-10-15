"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Project } from "./data";

export function ProjectView({ project }: { project: Project }) {
  return (
    <div className="rifki-page">
      {/* Back header */}
      <Link
        href="/#portofolio"
        className="absolute left-0 top-0 z-40 flex items-center py-5 px-5 lg:px-[5vw]"
      >
        <ChevronLeft size={20} className="text-white" />
        <span className="text-sm text-white"> Back</span>
      </Link>

      {/* Content */}
      <div className="flex min-h-svh flex-col items-center justify-start px-4 pt-20 pb-16 lg:px-[10vw]">
        {/* Title */}
        <div className="mb-8 w-full max-w-5xl">
          <span className="text-sm font-semibold text-[#ffab00]">
            {project.year}
          </span>
          <h1 className="mt-2 text-3xl font-bold lg:text-5xl">
            {project.name}
          </h1>
        </div>

        {/* Description */}
        <div
          className="mb-8 w-full max-w-3xl text-sm font-light text-white/75 lg:text-base [&_p]:mb-3"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />

        {/* Gallery */}
        <div className="flex w-full max-w-5xl flex-col gap-6">
          {project.gallery.map((image, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${project.name} screenshot ${i + 1}`}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Note about images */}
        <p className="mt-8 max-w-3xl text-center text-xs text-white/30">
          Note: Gallery images are sourced from DatoCMS. If they appear blank,
          the source site&apos;s CMS bandwidth limit may still be in effect.
        </p>
      </div>
    </div>
  );
}
