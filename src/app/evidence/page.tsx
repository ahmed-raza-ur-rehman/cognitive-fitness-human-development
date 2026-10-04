import type { Metadata } from "next";
import Link from "next/link";
import { getAllClaims, knowledgeGraph } from "@/features/knowledge/content";
import { EvidenceCard } from "@/features/knowledge/evidence-card";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Evidence and limitations",
  description: "Review the sources, study contexts, and limits behind the first memory pathway.",
};

export default function EvidencePage() {
  const claims = getAllClaims();
  const activity = knowledgeGraph.activities[0];

  return (
    <main id="main-content" className="container journey-page" aria-labelledby="evidence-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Evidence" }]} />
      <PageIntro
        routeId="evidence"
        titleId="evidence-title"
        title="Research with the context included."
        lead="Each statement is linked to the population, outcome, study design, and limitation that shaped its wording. A source about a general learning method does not validate this product’s one-round activity."
      />

      <nav className="evidence-topic-nav" aria-label="Evidence topics">
        <a href="#working-memory-evidence">Working memory</a>
        <a href="#attention-evidence">Attention</a>
        <a href="#retrieval-evidence">Retrieval and learning</a>
        <a href="#activity-boundary">Activity limits</a>
      </nav>

      <section className="evidence-topic" id="working-memory-evidence" aria-labelledby="working-memory-evidence-title">
        <h2 id="working-memory-evidence-title">Working memory</h2>
        <div className="evidence-claim-list">
          {claims.filter((claim) =>
            claim.id.startsWith("claim.working-memory") || claim.id === "claim.wm-training-transfer"
          ).map((claim) => (
            <EvidenceCard key={claim.id} claim={claim} />
          ))}
        </div>
      </section>

      <section className="evidence-topic" id="attention-evidence" aria-labelledby="attention-evidence-title">
        <h2 id="attention-evidence-title">Attention and task context</h2>
        <div className="evidence-claim-list">
          {claims.filter((claim) => claim.id === "claim.attention-in-working-memory").map((claim) => (
            <EvidenceCard key={claim.id} claim={claim} />
          ))}
        </div>
      </section>

      <section className="evidence-topic" id="retrieval-evidence" aria-labelledby="retrieval-evidence-title">
        <h2 id="retrieval-evidence-title">Retrieval practice and learning</h2>
        <div className="evidence-claim-list">
          {claims.filter((claim) => [
            "claim.retrieval-education",
            "claim.roediger-delay-contrast",
            "claim.practice-techniques",
          ].includes(claim.id)).map((claim) => (
            <EvidenceCard key={claim.id} claim={claim} />
          ))}
        </div>
      </section>

      <section className="activity-boundary" id="activity-boundary" aria-labelledby="activity-boundary-title">
        <p className="section-kicker">A clear boundary</p>
        <h2 id="activity-boundary-title">This activity is not a validated assessment.</h2>
        <p>
          “{activity.title}” reports only the number of distinct listed words
          entered in one round. The cited research gives background on learning
          and retrieval; it does not test or validate this activity.
        </p>
        <ul>
          {activity.notMeasures.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Link className="button button-quiet" href="/explore/memory">
          Return to the memory concept
        </Link>
      </section>

      <RouteOutlook
        routeId="evidence"
        title="Evidence is a starting point, not a verdict"
        note="From here the product offers a demonstration to run, concepts to read, and areas that stay reflective."
      />
    </main>
  );
}
