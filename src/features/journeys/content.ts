import journeysContent from "../../../content/journeys-v1.json";
import { getRouteById, type SiteRouteId } from "@/lib/routes";

export const JOURNEYS = journeysContent.journeys;

/** Shared framing shown on every path page: what finishing means and where care is needed. */
export const JOURNEY_COPY = {
  title: journeysContent.title,
  intro: journeysContent.intro,
  outcomeNotice: journeysContent.outcomeNotice,
  boundaryNotice: journeysContent.boundaryNotice,
};
export type Journey = (typeof JOURNEYS)[number];
export type JourneyStep = Journey["steps"][number];
export type JourneyStepKind = JourneyStep["kind"];

export const JOURNEY_STEP_LABELS: Record<JourneyStepKind, string> = {
  understand: "Understand",
  experience: "Experience",
  inspect: "Inspect",
  practice: "Practise",
  apply: "Apply",
  reflect: "Reflect",
};

export const JOURNEY_STEP_PURPOSES: Record<JourneyStepKind, string> = {
  understand: "A short explanation, in plain language first.",
  experience: "Something to do, at your own pace, with no countdown.",
  inspect: "What the result can support and where it stops.",
  practice: "One defined task with visible rules and scoring.",
  apply: "An optional action off the screen, adaptable or skippable.",
  reflect: "A question about fit, not about your worth.",
};

export const MAX_JOURNEY_MINUTES = JOURNEYS.reduce((total, journey) => total + journey.minutes, 0);

export function getJourneyBySlug(slug: string): Journey | undefined {
  return JOURNEYS.find((journey) => journey.slug === slug);
}

export function getJourneysForConcept(conceptId: string): Journey[] {
  return JOURNEYS.filter((journey) => journey.relatedConceptIds.includes(conceptId));
}

export function getJourneysForPathway(pathwayId: string): Journey[] {
  return JOURNEYS.filter((journey) => journey.relatedPathwayIds.includes(pathwayId));
}

export function getJourneysForRoute(routeId: SiteRouteId): Journey[] {
  return JOURNEYS.filter((journey) => journey.steps.some((step) => step.href.split("#")[0] === getRouteById(routeId)?.path));
}

export function resolveStepIndex(rawStep: string | string[] | undefined, stepCount: number): number {
  const value = Array.isArray(rawStep) ? rawStep[0] : rawStep;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(stepCount, Math.max(1, parsed));
}
