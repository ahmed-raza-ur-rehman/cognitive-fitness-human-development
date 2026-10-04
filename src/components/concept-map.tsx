import Link from "next/link";
import {
  getConceptBySlug,
  getRelatedConcepts,
} from "@/features/knowledge/content";

const memory = getConceptBySlug("memory");
const relatedConcepts = memory ? getRelatedConcepts(memory.id) : [];
const positions = [
  { x: 116, y: 82, radius: 39 },
  { x: 365, y: 85, radius: 42 },
];

export function ConceptMap() {
  if (!memory) {
    return null;
  }

  const positionedConcepts = relatedConcepts.slice(0, positions.length).map((item, index) => ({
    ...item,
    ...positions[index],
  }));
  const relationshipNames = positionedConcepts.map(({ concept }) => concept.title).join(", ");

  return (
    <div className="concept-map-block">
      <figure className="concept-figure">
        <div className="concept-figure-topline">
          <span className="mini-label">A CONCEPTUAL MAP</span>
          <span className="map-index">{String(positionedConcepts.length + 1).padStart(2, "0")} IDEAS</span>
        </div>
        <svg
          aria-describedby="concept-map-caption"
          aria-labelledby="concept-map-title concept-map-description"
          className="concept-map"
          role="img"
          viewBox="0 0 480 340"
        >
          <title id="concept-map-title">A small map of memory concepts</title>
          <desc id="concept-map-description">
            Memory is shown beside {relationshipNames}. The lines mark related
            topics, not causes, brain regions, or anatomical connections.
          </desc>
          <defs>
            <radialGradient id="memoryGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b8f0da" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#b8f0da" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="map-glow" cx="240" cy="168" r="104" fill="url(#memoryGlow)" />
          {positionedConcepts.map((item) => (
            <line
              className="map-line map-line-main"
              key={`edge-${item.concept.id}`}
              x1="240"
              y1="168"
              x2={item.x}
              y2={item.y}
            />
          ))}
          <circle className="map-orbit" cx="240" cy="168" r="87" />
          <g className="map-node map-node-primary">
            <circle cx="240" cy="168" r="43" />
            <text x="240" y="172" textAnchor="middle">{memory.title.toUpperCase()}</text>
          </g>
          {positionedConcepts.map(({ concept, x, y, radius }) => {
            const words = concept.title.toUpperCase().split(" ");
            const lineHeight = 14;
            const firstY = y - ((words.length - 1) * lineHeight) / 2 + 4;

            return (
              <g className="map-node" key={concept.id}>
                <circle cx={x} cy={y} r={radius} />
                {words.map((word, index) => (
                  <text
                    key={`${concept.id}-${word}`}
                    x={x}
                    y={firstY + index * lineHeight}
                    textAnchor="middle"
                  >
                    {word}
                  </text>
                ))}
              </g>
            );
          })}
          <circle className="map-spark" cx="295" cy="76" r="3" />
          <circle className="map-spark map-spark-alt" cx="161" cy="245" r="2.5" />
        </svg>
        <figcaption id="concept-map-caption">
          A simplified learning map—not a brain scan or anatomical diagram.
        </figcaption>
      </figure>
      <nav className="concept-map-navigation" aria-label="Related memory concepts">
        <p className="mini-label">FOLLOW A CONNECTION</p>
        <ul>
          {positionedConcepts.map(({ concept, label }) => (
            <li key={concept.id}>
              <Link href={`/explore/${concept.slug}`}>
                <span>{concept.title}</span>
                <span className="concept-map-link-label">{label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
