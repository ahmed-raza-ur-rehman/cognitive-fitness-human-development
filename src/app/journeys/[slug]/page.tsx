import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";
import {
  JOURNEYS,
  JOURNEY_COPY,
  JOURNEY_STEP_LABELS,
  getJourneyBySlug,
} from "@/features/journeys/content";
import { getRouteByHref, ROUTE_KIND_LABELS } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return JOURNEYS.map((journey) => ({ slug: journey.slug }));
}

type JourneyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);

  return journey
    ? { title: journey.title, description: journey.summary }
    : { title: "Path not found" };
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);

  if (!journey) {
    notFound();
  }

  return (
    <main id="main-content" className="container journey-page" aria-labelledby="journey-title">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guided paths", href: "/journeys" },
          { label: journey.title },
        ]}
      />
      <PageIntro
        eyebrow={`Guided path / ${journey.audience}`}
        title={journey.title}
        lead={journey.summary}
        boundary={journey.boundary}
      />

      <section className="path-brief" aria-labelledby="path-brief-title">
        <div>
          <p className="mini-label">The question this path works on</p>
          <p className="path-question">“{journey.question}”</p>
        </div>
        <dl className="path-facts">
          <div>
            <dt>Length</dt>
            <dd>{journey.minutes} minutes, untimed</dd>
          </div>
          <div>
            <dt>Steps</dt>
            <dd>{journey.steps.length}</dd>
          </div>
          <div>
            <dt>What finishing means</dt>
            <dd>{journey.outcome}</dd>
          </div>
        </dl>
      </section>

      <nav className="path-rail" aria-labelledby="path-rail-title">
        <p id="path-rail-title">All {journey.steps.length} steps</p>
        <ol>
          {journey.steps.map((step, index) => (
            <li key={step.id}>
              <a href={`#step-${step.id}`}>
                <span className="rail-number">{index + 1}</span>
                <span className="rail-kind">{JOURNEY_STEP_LABELS[step.kind]}</span>
                <span className="rail-title">{step.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="path-rail-note">
          Nothing records where you stopped. Use the links above, or your browser&apos;s back button, to return.
        </p>
      </nav>

      <ol className="path-steps">
        {journey.steps.map((step, index) => {
          const destination = getRouteByHref(step.href);
          const next = journey.steps[index + 1];
          const previous = journey.steps[index - 1];
          return (
            <li key={step.id}>
              <article className="path-step" id={`step-${step.id}`} aria-labelledby={`step-title-${step.id}`}>
                <header className="step-header">
                  <p className="step-index">
                    Step {index + 1} of {journey.steps.length}
                    <span className="step-kind">{JOURNEY_STEP_LABELS[step.kind]}</span>
                  </p>
                  <h2 id={`step-title-${step.id}`}>{step.title}</h2>
                </header>

                <dl className="step-explain">
                  <div>
                    <dt>Why this step is here</dt>
                    <dd>{step.purpose}</dd>
                  </div>
                  <div>
                    <dt>What to do</dt>
                    <dd>{step.action}</dd>
                  </div>
                  <div>
                    <dt>What you take with you</dt>
                    <dd>{step.takeaway}</dd>
                  </div>
                  <div>
                    <dt>What it cannot show</dt>
                    <dd>{step.caution}</dd>
                  </div>
                </dl>

                {destination ? (
                  <p className="step-destination">
                    <span className="mini-label">{ROUTE_KIND_LABELS[destination.kind]}</span>
                    {destination.purpose}
                  </p>
                ) : null}

                <div className="step-actions">
                  <Link className="button button-primary" href={step.href}>
                    {step.linkLabel} <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="button button-quiet" href="#path-rail-title">
                    See the whole path
                  </Link>
                </div>

                <nav className="step-nav" aria-label={`Move within ${journey.title}`}>
                  {previous ? (
                    <Link href={`#step-${previous.id}`}>
                      <span aria-hidden="true">←</span> Previous: {previous.title}
                    </Link>
                  ) : (
                    <span className="step-nav-edge">You are at the first step.</span>
                  )}
                  {next ? (
                    <Link href={`#step-${next.id}`}>
                      Next: {next.title} <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <Link className="step-nav-edge" href={`/journeys`}>
                      Path complete — choose another
                    </Link>
                  )}
                </nav>
              </article>
            </li>
          );
        })}
      </ol>

      <aside className="path-close" aria-labelledby="path-close-title">
        <p className="section-kicker">When the path ends</p>
        <h2 id="path-close-title">Stop here, or use one idea today.</h2>
        <p>
          {JOURNEY_COPY.outcomeNotice} This path linked to {journey.steps.length} places in the product; it did not score you,
          store an answer, or open anything by itself.
        </p>
        <Link className="text-link" href="/journeys">
          Choose another question <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <RouteOutlook
        routeId={`journey-${journey.slug}`}
        title="Still connected after the path"
        note="These are the pages this path touches. Each works on its own."
      />
    </main>
  );
}
