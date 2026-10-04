import Link from "next/link";
import type { RelatedConcept } from "@/features/knowledge/content";

export function RelatedConceptList({
  concepts,
  heading = "Related concepts",
}: {
  concepts: RelatedConcept[];
  heading?: string;
}) {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <section className="related-section" aria-labelledby="related-concepts-title">
      <div className="related-heading">
        <p className="section-kicker">Follow a connection</p>
        <h2 id="related-concepts-title">{heading}</h2>
      </div>
      <ul className="related-list">
        {concepts.map(({ concept, relationshipId, relationshipType, label }) => (
          <li key={relationshipId}>
            <Link href={`/explore/${concept.slug}`}>
              <span className="related-type">{relationshipType.replaceAll("_", " ")}</span>
              <span className="related-title">{concept.title}</span>
              <span className="related-description">{label}</span>
              <span className="related-summary">{concept.summary}</span>
              <span className="related-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
