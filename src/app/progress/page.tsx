import type { Metadata } from "next";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";
import { ProgressPanel } from "@/features/progress/progress-panel";

export const metadata: Metadata = {
  title: "My practice",
  description:
    "A read-only view of the practice sessions you chose to save on this device: counts, ranges, and cadence per activity — never a combined ability score.",
};

export default function ProgressPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="progress-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Train", href: "/train" }, { label: "My practice" }]} />
      <PageIntro
        routeId="progress"
        title="Your saved practice, described carefully."
        lead="This page reads the local records the training hub keeps when you turn on saving, and shows them as counts, ranges, and cadence per activity. Nothing is uploaded, and nothing is combined into one number."
        boundary="These are descriptive records of your own saved sessions—not an assessment, a diagnosis, or evidence that a general ability changed. Item sets and conditions differ between sessions, so differences across weeks are not measured improvement. Export or clear everything from the training hub at any time."
        actions={[
          { label: "Back to practice", href: "/train#active-training", hint: "Start, pause, export, or clear" },
          { label: "Read the activity boundary", href: "/evidence#activity-boundary", hint: "Why task scores stay task-specific" },
        ]}
      />

      <ProgressPanel />

      <RouteOutlook
        routeId="progress"
        title="Where the numbers came from, and where they stop"
        note="Practice controls, evidence context, and the privacy summary are all reachable from here."
      />
    </main>
  );
}
