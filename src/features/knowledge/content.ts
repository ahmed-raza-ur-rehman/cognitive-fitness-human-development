import graph from "../../../content/knowledge-v1.json";

export const knowledgeGraph = graph;

export type KnowledgeConcept = (typeof graph.concepts)[number];
export type KnowledgeClaim = (typeof graph.claims)[number];
export type EvidenceSource = (typeof graph.evidenceSources)[number];
export type ContentLimitation = (typeof graph.limitations)[number];
export type KnowledgeActivity = (typeof graph.activities)[number];

export type RelatedConcept = {
  concept: KnowledgeConcept;
  relationshipId: string;
  relationshipType: string;
  label: string;
};

const conceptsById = new Map(graph.concepts.map((concept) => [concept.id, concept]));
const claimsById = new Map(graph.claims.map((claim) => [claim.id, claim]));
const sourcesById = new Map(graph.evidenceSources.map((source) => [source.id, source]));
const limitationsById = new Map(graph.limitations.map((limitation) => [limitation.id, limitation]));

export function getConceptBySlug(slug: string): KnowledgeConcept | undefined {
  return graph.concepts.find((concept) => concept.slug === slug);
}

export function getConceptById(id: string): KnowledgeConcept | undefined {
  return conceptsById.get(id);
}

export function getClaimsForConcept(concept: KnowledgeConcept): KnowledgeClaim[] {
  return concept.claimIds.flatMap((id) => {
    const claim = claimsById.get(id);
    return claim ? [claim] : [];
  });
}

export function getAllClaims(): KnowledgeClaim[] {
  return graph.claims;
}

export function getEvidenceSourcesForClaim(claim: KnowledgeClaim): EvidenceSource[] {
  return claim.sourceIds.flatMap((id) => {
    const source = sourcesById.get(id);
    return source ? [source] : [];
  });
}

export function getLimitationsForClaim(claim: KnowledgeClaim): ContentLimitation[] {
  return claim.limitationIds.flatMap((id) => {
    const limitation = limitationsById.get(id);
    return limitation ? [limitation] : [];
  });
}

export function getActivityForConcept(conceptId: string): KnowledgeActivity | undefined {
  return graph.activities.find((activity) => activity.conceptIds.includes(conceptId));
}

export function getRelatedConcepts(conceptId: string): RelatedConcept[] {
  const related: RelatedConcept[] = [];
  const seen = new Set<string>();

  for (const relationship of graph.relationships) {
    if (relationship.fromId !== conceptId && relationship.toId !== conceptId) {
      continue;
    }

    const otherId = relationship.fromId === conceptId
      ? relationship.toId
      : relationship.fromId;
    const concept = conceptsById.get(otherId);

    if (!concept || seen.has(concept.id)) {
      continue;
    }

    seen.add(concept.id);
    related.push({
      concept,
      relationshipId: relationship.id,
      relationshipType: relationship.type,
      label: relationship.label,
    });
  }

  return related;
}
