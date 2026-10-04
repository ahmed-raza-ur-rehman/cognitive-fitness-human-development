import Link from "next/link";
import { knowledgeGraph } from "@/features/knowledge/content";

export function ConceptList() {
  return (
    <ul className="concept-list">
      {knowledgeGraph.concepts.map((concept, index) => (
        <li key={concept.id}>
          <Link href={`/explore/${concept.slug}`}>
            <span className="concept-list-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="concept-list-copy">
              <span className="concept-list-title">{concept.title}</span>
              <span className="concept-list-summary">{concept.summary}</span>
            </span>
            <span className="related-arrow" aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
