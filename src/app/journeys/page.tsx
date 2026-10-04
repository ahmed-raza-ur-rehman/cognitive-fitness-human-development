import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";
import {
  JOURNEYS,
  JOURNEY_COPY,
  JOURNEY_STEP_LABELS,
  JOURNEY_STEP_PURPOSES,
} from "@/features/journeys/content";

export const metadata: Metadata = {
  title: "Guided paths",
  description:
    "Short, ordered routes that pair an explanation with something to try, the evidence around it, and a next step you can skip.",
};

const stepKindOrder = Object.keys(JOURNEY_STEP_LABELS) as (keyof typeof JOURNEY_STEP_LABELS)[];

export default function JourneysPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="journeys-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guided paths" }]} />
      <PageIntro
        routeId="journeys"
        title="A path, not a syllabus."
        lead="Each path answers one question in a few short moves: understand the idea, experience something, read what the result can support, then practise or apply it if it is useful."
        boundary={JOURNEY_COPY.boundaryNotice}
        actions={[
          { label: "Open the memory path", href: "/journeys/memory-first", hint: "About 20 minutes, self-paced" },
          { label: "Start with orientation", href: "/journeys/start-here", hint: "Ten minutes, no setup" },
        ]}
      />

      <section className="journey-structure" aria-labelledby="journey-structure-title">
        <div className="directory-heading">
          <div>
            <p className="mini-label">ONE SHAPE, USED EVERYWHERE</p>
            <h2 id="journey-structure-title">How a path is built</h2>
          </div>
          <p>
            The same six step kinds appear in every path, in the same order of purpose, so you can tell what a step is
            for before you open it.
          </p>
        </div>
        <ol className="kind-legend">
          {stepKindOrder.map((kind) => (
            <li key={kind}>
              <span className="kind-name">{JOURNEY_STEP_LABELS[kind]}</span>
              <span className="kind-purpose">{JOURNEY_STEP_PURPOSES[kind]}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="journey-outcome-notice">{JOURNEY_COPY.outcomeNotice}</p>

      <section className="journey-directory" aria-labelledby="journey-directory-title">
        <div className="directory-heading">
          <div>
            <p className="mini-label">{JOURNEYS.length} PATHS / UNTIMED / NO ACCOUNT</p>
            <h2 id="journey-directory-title">Choose the question, not the subject</h2>
          </div>
          <p>Pick the one that matches what brought you here. You can leave a path halfway without losing anything.</p>
        </div>

        <ul className="journey-list">
          {JOURNEYS.map((journey) => (
            <li key={journey.id}>
              <article className="journey-card" aria-labelledby={`journey-${journey.slug}`}>
                <p className="journey-question">{journey.question}</p>
                <h3 id={`journey-${journey.slug}`}>{journey.title}</h3>
                <p>{journey.summary}</p>
                <p className="journey-meta">
                  <span>{journey.audience}</span>
                  <span>{journey.minutes} minutes</span>
                  <span>{journey.steps.length} steps</span>
                </p>
                <ol className="journey-rail" aria-label={`Steps in ${journey.title}`}>
                  {journey.steps.map((step) => (
                    <li key={step.id}>
                      <span className="rail-kind">{JOURNEY_STEP_LABELS[step.kind]}</span>
                      <span className="rail-title">{step.title}</span>
                    </li>
                  ))}
                </ol>
                <div className="journey-card-actions">
                  <Link className="button button-primary" href={`/journeys/${journey.slug}`}>
                    Open this path <span aria-hidden="true">→</span>
                  </Link>
                  <span className="journey-outcome">{journey.outcome}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <aside className="journey-next" aria-labelledby="journeys-without-path-title">
        <div>
          <p className="section-kicker">No path needed</p>
          <h2 id="journeys-without-path-title">Rather wander than follow?</h2>
          <p>
            Paths are a suggestion. The concept map, the activity list, and the evidence library each work on their own,
            in any order, with no completion requirement.
          </p>
        </div>
        <Link className="button button-outline" href="/explore">
          Open the concept map <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <RouteOutlook
        routeId="journeys"
        title="The rest of the space"
        note="A path links into the areas above. You can also enter them directly."
      />
    </main>
  );
}
