import type { Metadata } from "next";
import Link from "next/link";
import { ConceptList } from "@/features/knowledge/concept-list";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Explore cognition, learning, and recovery",
  description: "Follow reviewed connections across memory, learning, and whole-person recovery at your own pace.",
};

export default function ExplorePage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="explore-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Explore" }]} />
      <PageIntro
        routeId="explore"
        titleId="explore-title"
        title="Start with a question. Follow the connections."
        lead="Move between memory, learning, and recovery one idea at a time. Each page begins with a short explanation; population, study design, evidence, and limitations are available when you want more detail. Looking beyond the reviewed concept map? Browse the wider Development Atlas for practical starting points across emotion, social life, health foundations, creativity, and development."
      />

      <section className="path-teaser" aria-labelledby="path-teaser-title">
        <div>
          <p className="section-kicker">Rather be led than browse?</p>
          <h2 id="path-teaser-title">Guided paths order these pages into one question.</h2>
          <p>
            Each path pairs a concept with a demonstration, its evidence limits, and a practice or application step. You
            can leave at any point; nothing is tracked or required.
          </p>
        </div>
        <Link className="button button-primary" href="/journeys">
          Choose a guided path <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="concept-directory" aria-labelledby="concept-directory-title">
        <div className="directory-heading">
          <div>
            <p className="mini-label">A SMALL, REVIEWED MAP</p>
            <h2 id="concept-directory-title">Choose a concept</h2>
          </div>
          <p>Connections are labeled as relationships, not as causes.</p>
        </div>
        <ConceptList />
      </section>

      <aside className="journey-next" aria-labelledby="explore-next-title">
        <div>
          <p className="section-kicker">Optional memory demonstration</p>
          <h2 id="explore-next-title">One short round, at your pace.</h2>
          <p>
            The recall activity reports only what you enter in one round. It is
            not a test of your overall memory or intelligence.
          </p>
        </div>
        <Link className="button button-primary" href="/explore/memory">
          Open the memory pathway <span aria-hidden="true">→</span>
        </Link>
      </aside>
      <RouteOutlook
        routeId="explore"
        title="Where a concept can take you"
        note="Three exits, each with a different job: try something, read the bounds, or widen the frame."
      />
    </main>
  );
}
