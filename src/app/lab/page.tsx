import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCard } from "@/features/knowledge/evidence-card";
import { knowledgeGraph } from "@/features/knowledge/content";
import { WordRecallExperiment } from "@/features/experiment/word-recall-experiment";
import { Breadcrumbs, PageIntro, RouteOutlook } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Self-paced recall demonstration",
  description: "Try one short, untimed word-recall activity and inspect its task-level result.",
};

const retrievalClaim = knowledgeGraph.claims.find(
  (claim) => claim.id === "claim.retrieval-education",
);

export default function LabPage() {
  return (
    <main id="main-content" className="container journey-page" aria-labelledby="lab-title">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lab" }]} />
      <PageIntro
        routeId="lab"
        titleId="lab-title"
        title="One short recall demonstration."
        lead="This is a small educational activity, not a timed test or a measure of your overall memory. No account, microphone, or audio is needed. You control the pace and can leave at any time."
        boundary="Nothing here is sent to a server or to an AI service, and no result is stored unless you later choose to save practice sessions in Train."
      />

      <section className="activity-instructions" aria-labelledby="instructions-title">
        <h2 id="instructions-title">What will happen</h2>
        <ul className="instruction-list">
          <li>You will look at a short list of words and choose when to hide it.</li>
          <li>Then you can enter any words you remember. There is no response timer.</li>
          <li>The result counts distinct listed words entered in this one round.</li>
        </ul>
        <h3>What it can—and cannot—tell you</h3>
        <p>
          It shows one observable task result. It does not measure working-memory
          capacity, overall memory, attention, intelligence, long-term retention,
          health, or future performance. There is no comparison group or personal
          history saved.
        </p>
        <p>
          The word list stays in this page’s active session only. It is not sent
          to a server or AI, and it is cleared when you leave or reload.
        </p>
        <Link className="text-link" href="/explore/memory">
          Back to the memory concept <span aria-hidden="true">←</span>
        </Link>
      </section>

      <WordRecallExperiment />

      <section className="lab-evidence" id="lab-evidence" aria-labelledby="lab-evidence-title">
        <p className="section-kicker">Research context / not an endorsement of this activity</p>
        <h2 id="lab-evidence-title">What research says about retrieval practice</h2>
        <p>
          Studies of retrieval practice provide background about learning
          strategies. They did not test this one-round word list, and this
          activity has no delayed follow-up or independent validity study.
        </p>
        {retrievalClaim ? <EvidenceCard claim={retrievalClaim} /> : null}
        <div className="lab-evidence-links">
          <Link className="text-link" href="/evidence#retrieval-evidence">
            Browse all sources and limitations <span aria-hidden="true">→</span>
          </Link>
          <Link className="text-link" href="/explore/retrieval-practice">
            Explore retrieval practice <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <RouteOutlook
        routeId="lab"
        title="After the round"
        note="A demonstration is most useful when it leads somewhere: the concept behind it, the evidence around it, or practice."
      />
    </main>
  );
}
