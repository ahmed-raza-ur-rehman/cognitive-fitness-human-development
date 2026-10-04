import atlas from "../../../content/development-atlas-v1.json";

export const DEVELOPMENT_ATLAS = atlas;
export type DevelopmentPathway = (typeof atlas.pathways)[number];
export type DevelopmentCluster = (typeof atlas.clusters)[number];
export type DevelopmentReference = (typeof atlas.references)[number];
export type DevelopmentPathwayKind = DevelopmentPathway["type"];

export const MAX_PLANNED_PATHWAYS = 3;

export const PATHWAY_TYPE_LABELS: Record<DevelopmentPathwayKind, string> = {
  "task-practice": "Task-specific practice",
  "everyday-practice": "Everyday skill practice",
  "support-context": "Support and context",
  "learn-reflect": "Explore and reflect",
};

const pathwaysById = new Map(atlas.pathways.map((pathway) => [pathway.id, pathway]));
const referencesById = new Map(atlas.references.map((reference) => [reference.id, reference]));

export function getPathwayById(id: string): DevelopmentPathway | undefined {
  return pathwaysById.get(id);
}

export function getReferenceById(id: string): DevelopmentReference | undefined {
  return referencesById.get(id);
}

export function getPathwaysForCluster(clusterId: string): DevelopmentPathway[] {
  return atlas.pathways.filter((pathway) => pathway.clusterId === clusterId);
}
