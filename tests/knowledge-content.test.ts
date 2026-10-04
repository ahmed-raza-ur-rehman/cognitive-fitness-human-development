import { describe, expect, it } from "vitest";
import {
  getActivityForConcept,
  getClaimsForConcept,
  getConceptBySlug,
  getRelatedConcepts,
} from "../src/features/knowledge/content";

describe("reviewed learning content", () => {
  it("resolves a stable concept slug and its related concepts", () => {
    const memory = getConceptBySlug("memory");

    expect(memory?.id).toBe("concept.memory");
    expect(getRelatedConcepts(memory!.id).map(({ concept }) => concept.slug)).toEqual([
      "working-memory",
      "retrieval-practice",
      "sleep",
    ]);
  });

  it("keeps research-only capacity detail attached to its limitation", () => {
    const workingMemory = getConceptBySlug("working-memory");
    const claims = getClaimsForConcept(workingMemory!);

    expect(claims.find((claim) => claim.id === "claim.working-memory-limits")?.surfacePolicy)
      .toBe("research-detail-only");
    expect(claims.find((claim) => claim.id === "claim.working-memory-limits")?.limitationIds)
      .toContain("limit.cowan-model-and-task");
  });

  it("finds the implemented demo without suggesting it has efficacy evidence", () => {
    const activity = getActivityForConcept("concept.retrieval-practice");

    expect(activity?.status).toBe("implemented-in-s6");
    expect(activity?.routePath).toBe("/lab");
    expect(activity?.efficacyEvidenceIds).toEqual([]);
    expect(activity?.notMeasures).toContain("working-memory capacity");
  });

  it("connects sleep to memory and learning without turning graph links into causal claims", () => {
    const sleep = getConceptBySlug("sleep");
    const learning = getConceptBySlug("learning");

    expect(sleep?.id).toBe("concept.sleep");
    expect(getRelatedConcepts(sleep!.id).map(({ concept }) => concept.slug)).toEqual([
      "memory",
      "learning",
    ]);
    expect(getRelatedConcepts(learning!.id).map(({ concept }) => concept.slug)).toContain("sleep");
    expect(getRelatedConcepts(sleep!.id).every(({ label }) => /not/i.test(label)))
      .toBe(true);

    const claims = getClaimsForConcept(sleep!);
    expect(claims.map(({ id }) => id)).toEqual([
      "claim.sleep-duration-guideline",
      "claim.sleep-memory-review",
      "claim.sleep-deprivation-memory",
    ]);
    for (const claim of claims) {
      expect(claim.population).toBeTruthy();
      expect(claim.outcome).toBeTruthy();
      expect(claim.studyDesign).toBeTruthy();
      expect(claim.evidenceLabel).toBeTruthy();
      expect(claim.limitationIds.length).toBeGreaterThan(0);
    }
  });

  it("describes the sleep planner as clock arithmetic, not a measured or validated intervention", () => {
    const activity = getActivityForConcept("concept.sleep");

    expect(activity?.id).toBe("activity.sleep-opportunity-planner");
    expect(activity?.status).toBe("implemented-in-s11");
    expect(activity?.measureIds).toEqual([]);
    expect(activity?.efficacyEvidenceIds).toEqual([]);
    expect(activity?.notMeasures).toContain("actual sleep duration or sleep quality");
    expect(activity?.notMeasures).toContain("memory, attention, learning, or cognitive transfer");
    expect(activity?.limitationIds).toContain("limit.sleep-planner-not-clinical-guidance");
  });
});
