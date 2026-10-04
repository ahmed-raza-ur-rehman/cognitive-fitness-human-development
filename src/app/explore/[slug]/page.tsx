import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EvidenceCard } from "@/features/knowledge/evidence-card";
import { SleepOpportunityPlanner } from "@/features/knowledge/sleep-opportunity-planner";
import {
  getActivityForConcept,
  getClaimsForConcept,
  getConceptBySlug,
  getRelatedConcepts,
  knowledgeGraph,
} from "@/features/knowledge/content";
import { RelatedConceptList } from "@/features/knowledge/related-concepts";
import { getJourneysForConcept, JOURNEY_STEP_LABELS } from "@/features/journeys/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return knowledgeGraph.concepts.map((concept) => ({ slug: concept.slug }));
}

type ConceptPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ConceptPageProps): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  return concept
    ? { title: concept.title, description: concept.summary }
    : { title: "Concept not found" };
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  if (!concept) {
    notFound();
  }

  const claims = getClaimsForConcept(concept);
  const relatedConcepts = getRelatedConcepts(concept.id);
  const activity = getActivityForConcept(concept.id);
  const isSleepPathway = concept.id === "concept.sleep";

  return (
    <main id="main-content" className="container journey-page" aria-labelledby="concept-title">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/explore">Explore</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{concept.title}</span>
      </nav>

      <header className="concept-intro">
        <p className="section-kicker">Explore / concept</p>
        <h1 id="concept-title">{concept.title}</h1>
        <p className="concept-summary">{concept.summary}</p>
        {isSleepPathway ? (
          <p className="education-boundary">
            Educational information only—not medical advice, diagnosis, treatment, or a sleep
            measurement. The AASM/SRS consensus statement advises people concerned about
            sleeping too little or too much to consult their healthcare provider.{" "}
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/" target="_blank" rel="noreferrer">
              Read the statement <span className="visually-hidden">(opens in a new tab)</span>
            </a>.
          </p>
        ) : (
          <p className="education-boundary">
            Educational content only. A practice-task result is not a diagnosis
            or a measure of your overall ability.
          </p>
        )}
      </header>

      <RelatedConceptList concepts={relatedConcepts} />

      {activity?.id === "activity.sleep-opportunity-planner" ? (
        <SleepOpportunityPlanner />
      ) : activity ? (
        <section className="journey-next" aria-labelledby="concept-activity-title">
          <div>
            <p className="section-kicker">Optional / self-paced</p>
            <h2 id="concept-activity-title">Try one short recall demonstration</h2>
            <p>
              You decide when to hide the list. There is no countdown, and this
              single round does not measure working-memory capacity or long-term learning.
            </p>
          </div>
          <Link className="button button-primary" href={activity.routePath}>
            Read the instructions <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : null}

      {getJourneysForConcept(concept.id).length > 0 ? (
        <section className="concept-paths" aria-labelledby="concept-paths-title">
          <div className="directory-heading">
            <div>
              <p className="section-kicker">Guided paths through this idea</p>
              <h2 id="concept-paths-title">Follow this concept as a sequence.</h2>
            </div>
            <p>A path adds a demonstration, the evidence around it, and one thing to do next. Leave whenever you like.</p>
          </div>
          <ul className="path-mini-list">
            {getJourneysForConcept(concept.id).map((journey) => (
              <li key={journey.id}>
                <Link href={`/journeys/${journey.slug}`}>
                  <strong>{journey.title}</strong>
                  <span>{journey.question}</span>
                  <span className="path-mini-meta">
                    {journey.steps.length} steps · about {journey.minutes} minutes · starts with {JOURNEY_STEP_LABELS[journey.steps[0].kind].toLowerCase()}
                  </span>
                  <span className="related-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="concept-evidence" aria-labelledby="concept-evidence-title">
        <div className="directory-heading">
          <div>
            <p className="section-kicker">Evidence / with its edges left in</p>
            <h2 id="concept-evidence-title">What the sources support</h2>
          </div>
          <p>Open a claim to inspect its source, study context, and limits.</p>
        </div>
        <div className="evidence-claim-list">
          {claims.map((claim) => (
            <EvidenceCard key={claim.id} claim={claim} />
          ))}
        </div>
        <Link className="text-link" href="/evidence">
          Browse all evidence <span aria-hidden="true">→</span>
        </Link>
      </section>

      {relatedConcepts.length > 0 ? (
        <nav className="journey-return" aria-label="Continue exploring">
          <Link href="/explore">Return to all concepts</Link>
          <Link href="/evidence">Open the evidence library</Link>
        </nav>
      ) : null}
    </main>
  );
}
