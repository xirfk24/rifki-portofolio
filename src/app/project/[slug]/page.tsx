import { notFound } from "next/navigation";
import { projects } from "@/components/sites/rifki/data";
import { ProjectView } from "@/components/sites/rifki/project-view";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // params is a Promise in Next.js 16
  return <ProjectViewWrapper params={params} />;
}

// Need a client wrapper since params is async in Next 16
import { Suspense } from "react";

function ProjectViewWrapper({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#0b0b0b]" />}>
      <AsyncProjectView params={params} />
    </Suspense>
  );
}

async function AsyncProjectView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return notFound();

  return <ProjectView project={project} />;
}
