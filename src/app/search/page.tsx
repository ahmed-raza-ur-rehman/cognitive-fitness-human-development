import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, PageIntro } from "@/components/page-shell";
import { SearchPanel } from "@/features/search/search-panel";

export const metadata: Metadata = {
  title: "Find a page",
  description:
    "Search the space by word — concepts, guided paths, practice activities, development areas, and evidence items. Nothing is sent to a server.",
};

export default function SearchPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="search-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Find" }]} />
      <PageIntro
        routeId="search"
        title="Find it by word, not by memory of the layout."
        lead="Type what you are trying to understand — a concept, a difficulty, an activity, a source. Results are this product's own reviewed pages, ranked by how directly they match."
        boundary="Search runs in your browser over the content this page already contains: no request, no log, and nothing stored. If you would rather browse, the concept, path, activity, atlas, and evidence indexes each list everything in their area."
      />

      <Suspense fallback={<p className="search-fallback" role="status">Loading the search panel…</p>}>
        <SearchPanel />
      </Suspense>
    </main>
  );
}
