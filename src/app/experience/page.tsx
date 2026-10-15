import type { Metadata } from "next";
import { ExperiencePage } from "@/components/sites/rifki/experience-view";

export const metadata: Metadata = {
  title: "Rifki - Experience",
  description: "Created by Rifki with creativity",
};

export default function ExperienceRoute() {
  return <ExperiencePage />;
}
