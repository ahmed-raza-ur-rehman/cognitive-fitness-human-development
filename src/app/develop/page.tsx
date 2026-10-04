import type { Metadata } from "next";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import { DevelopmentAtlas } from "@/features/development/development-atlas";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Development Atlas",
  description:
    "Explore practical pathways across learning, attention, emotions, social connection, health foundations, creativity, brain science, and development across life.",
};

export default function DevelopPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="develop-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Develop" }]} />
      <PageIntro
        routeId="develop"
        titleId="develop-title"
        title="Explore what helps people learn, adapt, and grow."
        lead={DEVELOPMENT_ATLAS.intro}
        boundary={DEVELOPMENT_ATLAS.careNotice}
      />

      <DevelopmentAtlas />

      <RouteOutlook
        routeId="develop"
        title="From a pathway to something concrete"
        note="The atlas deliberately hands off: practice is in Train, explanation is in Explore, and evidence stays with every claim."
      />
    </main>
  );
}
