import { describe, expect, it } from "vitest";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import { knowledgeGraph } from "@/features/knowledge/content";
import {
  JOURNEYS,
  JOURNEY_COPY,
  JOURNEY_STEP_LABELS,
  JOURNEY_STEP_PURPOSES,
  getJourneyBySlug,
  getJourneysForConcept,
  getJourneysForPathway,
} from "@/features/journeys/content";
import { SITE_ROUTES, getRouteByHref } from "@/lib/routes";

const allowedAnchors = new Map<string, Set<string>>();
for (const route of SITE_ROUTES) {
  const anchors = new Set(route.anchors ?? []);
  if (route.path === "/develop") {
    for (const cluster of DEVELOPMENT_ATLAS.clusters) anchors.add(cluster.id);
    for (const pathway of DEVELOPMENT_ATLAS.pathways) anchors.add(`pathway-${pathway.id}`);
  }
  allowedAnchors.set(route.path, anchors);
}

describe("guided paths content", () => {
  it("frames every path with an outcome and a boundary, not a promise", () => {
    expect(JOURNEY_COPY.outcomeNotice).toMatch(/not a course grade|not a grade/i);
    expect(JOURNEY_COPY.boundaryNotice).toMatch(/educational only/i);

    for (const journey of JOURNEYS) {
      expect(journey.boundary.length).toBeGreaterThan(40);
      expect(journey.outcome.length).toBeGreaterThan(20);
      expect(journey.minutes).toBeLessThanOrEqual(60);
      expect(journey.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives every step a purpose, an action, a takeaway, and a limit", () => {
    for (const journey of JOURNEYS) {
      for (const step of journey.steps) {
        expect(step.purpose, `${step.id} needs a reason to exist`).toBeTruthy();
        expect(step.action, `${step.id} needs a concrete action`).toBeTruthy();
        expect(step.takeaway, `${step.id} needs a takeaway`).toBeTruthy();
        expect(step.caution, `${step.id} needs a stated limit`).toBeTruthy();
        expect(step.linkLabel.length).toBeGreaterThan(4);
        expect(Object.keys(JOURNEY_STEP_LABELS)).toContain(step.kind);
      }
    }
    expect(Object.keys(JOURNEY_STEP_LABELS).sort()).toEqual(Object.keys(JOURNEY_STEP_PURPOSES).sort());
  });

  it("links only to pages and anchors that render", () => {
    for (const journey of JOURNEYS) {
      for (const step of journey.steps) {
        const [pathname, hash] = step.href.split("#");
        const route = getRouteByHref(step.href);
        expect(route, `${step.id} links to ${pathname}, which is not registered`).toBeTruthy();
        if (hash) expect(allowedAnchors.get(pathname)?.has(hash), `${step.id} anchor ${hash} is missing`).toBe(true);
      }
    }
  });

  it("keeps the cross-links reciprocal with concepts and atlas pathways", () => {
    for (const journey of JOURNEYS) {
      for (const conceptId of journey.relatedConceptIds) {
        expect(knowledgeGraph.concepts.some((concept) => concept.id === conceptId)).toBe(true);
        expect(getJourneysForConcept(conceptId).map((entry) => entry.id)).toContain(journey.id);
      }
      for (const pathwayId of journey.relatedPathwayIds) {
        expect(DEVELOPMENT_ATLAS.pathways.some((pathway) => pathway.id === pathwayId)).toBe(true);
        expect(getJourneysForPathway(pathwayId).map((entry) => entry.id)).toContain(journey.id);
      }
    }
  });

  it("addresses distinct intents and never reuses a slug", () => {
    const slugs = JOURNEYS.map((journey) => journey.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(JOURNEYS.length).toBeGreaterThanOrEqual(5);
    expect(getJourneyBySlug("memory-first")?.question).toMatch(/forget/i);
    expect(getJourneyBySlug("nope")).toBeUndefined();
  });

  it("carries each path to evidence so a result cannot be overread", () => {
    for (const journey of JOURNEYS) {
      const hasEvidence = journey.steps.some((step) => step.kind === "inspect" || step.href.startsWith("/evidence"));
      expect(hasEvidence, `${journey.id} needs evidence context`).toBe(true);
    }
  });
});
