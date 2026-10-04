import {
  DEVELOPMENT_ATLAS,
  MAX_PLANNED_PATHWAYS,
  getPathwayById,
  type DevelopmentPathway,
} from "@/features/development/content";

/** Return only known, distinct selections, preserving the order chosen by the user. */
export function buildPracticeMenu(pathwayIds: readonly string[]): DevelopmentPathway[] {
  const seen = new Set<string>();
  const selected: DevelopmentPathway[] = [];

  for (const id of pathwayIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const pathway = getPathwayById(id);
    if (!pathway) continue;
    selected.push(pathway);
    if (selected.length === MAX_PLANNED_PATHWAYS) break;
  }

  return selected;
}

/** Plain-text export contains only the chosen public pathway content, no personal data. */
export function formatPracticeMenu(pathways: readonly DevelopmentPathway[]): string {
  if (pathways.length === 0) return "";

  const sections = pathways.map((pathway, index) => [
    `${index + 1}. ${pathway.title} — ${pathway.typeLabel}`,
    `Try: ${pathway.starter.title}`,
    ...pathway.starter.steps.map((step, stepIndex) => `  ${stepIndex + 1}) ${step}`),
    `Apply: ${pathway.apply}`,
    `Reflect: ${pathway.notice}`,
    `Boundary: ${pathway.boundary}`,
  ].join("\n"));

  return [
    "Optional practice menu",
    "Choose if and when these ideas fit. This is not a schedule, prescription, progress record, or promise of improvement.",
    "",
    ...sections.flatMap((section) => [section, ""]),
    "Selections are not saved by the atlas. Copying this text is your choice.",
  ].join("\n").trim();
}

/** Keep the exported list in the menu's content order, not a score or ranking. */
export function allDevelopmentPathwayIds(): string[] {
  return DEVELOPMENT_ATLAS.pathways.map((pathway) => pathway.id);
}
