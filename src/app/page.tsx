import Link from "next/link";
import { ConceptMap } from "@/components/concept-map";
import { IntentChooser, ReadingPromise, SystemMap } from "@/components/orientation-toolkit";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import homeAtlasStyles from "@/features/development/home-atlas.module.css";
import { JOURNEYS } from "@/features/journeys/content";

const guardrails = [
  { title: "No diagnosis", body: "Activities describe one round of a specific task. They do not identify conditions or predict health." },
  { title: "No pooled brain score", body: "Different tasks keep their own numbers. Nothing here is combined into one measure of a person." },
  { title: "No account, no obligation", body: "Exploring needs no signup. Optional progress stays on this device and can be exported or cleared." },
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero-section container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            A cognitive-science space, not a brain-game arcade
          </p>
          <h1 id="hero-title">
            Understand how you think.
            <span>Then try it, and read what it means.</span>
          </h1>
          <p className="hero-description">
            Explore how people remember, focus, learn, feel, connect, move, and recover. Each idea comes with something
            to experience, the evidence behind it, and a clear statement of what the result cannot show.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/journeys">
              Start a guided path <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button-quiet" href="/explore">
              Browse the concepts
            </Link>
            <Link className="button button-quiet" href="/search">
              Search for a word
            </Link>
          </div>
          <ul className="trust-notes" aria-label="How this space behaves">
            <li>No account to explore</li>
            <li>No diagnosis, ever</li>
            <li>Useful without AI</li>
            <li>Untimed by default</li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="visual-orbit orbit-one" aria-hidden="true" />
          <div className="visual-orbit orbit-two" aria-hidden="true" />
          <ConceptMap />
          <p className="visual-note">
            One corner of the map: three related ideas, labeled as relationships rather than causes.
          </p>
        </div>
      </section>

      <ReadingPromise />
      <IntentChooser />

      <section className="principles-strip" id="how-it-works" aria-label="What this space values">
        <div className="container principles-inner">
          <span>Curiosity, not configuration</span>
          <span className="principle-separator" aria-hidden="true">/</span>
          <span>Practice, not promises</span>
          <span className="principle-separator" aria-hidden="true">/</span>
          <span>Evidence, including its limits</span>
        </div>
      </section>

      <SystemMap />

      <section className="section container paths-section" aria-labelledby="home-paths-title">
        <div className="section-index" aria-hidden="true">01 <span /> A QUESTION, NOT A SYLLABUS</div>
        <div className="section-heading">
          <p className="section-kicker">Guided paths</p>
          <h2 id="home-paths-title">Start from what you actually wondered about.</h2>
          <p>
            A path is three to six steps long, untimed, and skip-friendly: an explanation, something to try, the
            evidence with its limits, and one thing you could do off-screen. Nothing records where you stopped.
          </p>
        </div>
        <ul className="path-preview-list">
          {JOURNEYS.map((journey) => (
            <li key={journey.id}>
              <Link href={`/journeys/${journey.slug}`}>
                <span className="path-preview-question">“{journey.question}”</span>
                <strong>{journey.title}</strong>
                <span className="path-preview-meta">
                  {journey.steps.length} steps · about {journey.minutes} minutes · {journey.audience}
                </span>
                <span className="path-preview-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="memory-section" id="lab" aria-labelledby="memory-title">
        <div className="container memory-layout">
          <div className="memory-copy">
            <p className="section-kicker">Try one thing</p>
            <h2 id="memory-title">A small task. A more honest result.</h2>
            <p>
              One self-paced recall round, with its own explanation of what it measured. Do it here or read the
              instructions first—either way, the number belongs to this list and this moment.
            </p>
            <div className="memory-tags" aria-label="Activity characteristics">
              <span>Self-paced</span>
              <span>Nothing stored</span>
              <span>Not diagnostic</span>
            </div>
            <Link className="text-link" href="/lab">
              Open the demonstration <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/evidence#retrieval-evidence">
              Read the evidence and its limits <span aria-hidden="true">→</span>
            </Link>
          </div>
          <aside className="result-preview" aria-label="Example of transparent activity feedback">
            <div className="result-preview-top">
              <span className="mini-label">A RESULT SHOULD SAY</span>
              <span className="result-dot" aria-hidden="true" />
            </div>
            <p className="result-quote">“You recalled 4 of 6 words in this round.”</p>
            <div className="result-divider" />
            <p className="result-caption">
              One observable result. No percentile, brain age, or diagnosis.
            </p>
            <div className="result-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </aside>
        </div>
      </section>

      <section className={homeAtlasStyles.homeAtlas} aria-labelledby="home-atlas-title">
        <div className="container">
          <div className={homeAtlasStyles.heading}>
            <div>
              <p className="section-kicker">Whole-person development</p>
              <h2 id="home-atlas-title">Four doorways into a much wider map.</h2>
            </div>
            <p>
              The atlas covers {DEVELOPMENT_ATLAS.pathways.length} areas across {DEVELOPMENT_ATLAS.clusters.length}
              groups. Some offer task-specific practice; others are for context, support, or reflection. They are never
              combined into a score.
            </p>
          </div>
          <div className={homeAtlasStyles.clusterGrid}>
            {DEVELOPMENT_ATLAS.clusters.map((cluster) => (
              <Link key={cluster.id} className={homeAtlasStyles.clusterLink} href={`/develop#${cluster.id}`}>
                <h3>{cluster.title}</h3>
                <p>{cluster.summary}</p>
                <span>Explore this area <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section container guardrail-section" aria-labelledby="guardrail-title">
        <div className="section-heading">
          <p className="section-kicker">Keeping the promise</p>
          <h2 id="guardrail-title">A useful space needs useful limits.</h2>
          <p>These are not footnotes; they decide what this product will not do.</p>
        </div>
        <div className="guardrail-grid">
          {guardrails.map((guardrail) => (
            <article key={guardrail.title} className="guardrail-card">
              <h3>{guardrail.title}</h3>
              <p>{guardrail.body}</p>
            </article>
          ))}
        </div>
        <Link className="text-link" href="/privacy">
          How data is handled here <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="closing-section container" id="about" aria-labelledby="closing-title">
        <div className="closing-mark" aria-hidden="true">✳</div>
        <div>
          <p className="section-kicker">An open learning space</p>
          <h2 id="closing-title">Your mind is not a score.</h2>
          <p>
            Follow a question, practise a defined task, or read where the evidence stops. Whichever you choose, the
            limits travel with the claim instead of hiding in fine print.
          </p>
        </div>
        <Link className="button button-outline" href="/journeys">
          Choose a path <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
