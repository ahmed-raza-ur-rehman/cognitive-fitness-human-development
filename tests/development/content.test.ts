import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_ATLAS,
  MAX_PLANNED_PATHWAYS,
  PATHWAY_TYPE_LABELS,
} from "@/features/development/content";
import { buildPracticeMenu, formatPracticeMenu } from "@/features/development/practice-menu";

const REQUIRED_PATHWAYS = [
  "memory-learning",
  "attention-executive",
  "reasoning-decisions",
  "metacognition",
  "creativity-curiosity",
  "emotional-skills",
  "stress-resilience",
  "social-connection",
  "sleep-recovery",
  "movement-sensory-health",
  "nutrition-hydration",
  "habits-motivation-environment",
  "brain-perception-consciousness",
  "lifespan-differences-aging",
];

describe("development atlas content", () => {
  it("covers the approved whole-person scope with stable, distinct pathways", () => {
    expect(DEVELOPMENT_ATLAS.pathways).toHaveLength(14);
    expect(DEVELOPMENT_ATLAS.pathways.map(({ id }) => id)).toEqual(REQUIRED_PATHWAYS);
    expect(new Set(DEVELOPMENT_ATLAS.pathways.map(({ id }) => id)).size).toBe(14);
    expect(DEVELOPMENT_ATLAS.clusters).toHaveLength(4);
  });

  it("gives every area an actionable start, application, observable reflection, and visible boundary", () => {
    for (const pathway of DEVELOPMENT_ATLAS.pathways) {
      expect(pathway.topics.length).toBeGreaterThanOrEqual(3);
      expect(pathway.starter.steps.length).toBeGreaterThanOrEqual(2);
      expect(pathway.offer).not.toBe("");
      expect(pathway.apply).not.toBe("");
      expect(pathway.notice).not.toBe("");
      expect(pathway.boundary).not.toBe("");
      expect(pathway.evidenceNote).not.toBe("");
      expect(pathway.links.length).toBeGreaterThan(0);
      expect(pathway.links.every(({ href }) => href.startsWith("/") || href.startsWith("#") || href.startsWith("https://"))).toBe(true);
    }
  });

  it("distinguishes task practice from everyday practice, support, and exploration", () => {
    expect(Object.keys(PATHWAY_TYPE_LABELS)).toEqual([
      "task-practice",
      "everyday-practice",
      "support-context",
      "learn-reflect",
    ]);
    expect(new Set(DEVELOPMENT_ATLAS.pathways.map(({ type }) => type))).toEqual(new Set(Object.keys(PATHWAY_TYPE_LABELS)));
    expect(DEVELOPMENT_ATLAS.pathways.find(({ id }) => id === "sleep-recovery")?.type).toBe("support-context");
    expect(DEVELOPMENT_ATLAS.pathways.find(({ id }) => id === "brain-perception-consciousness")?.type).toBe("learn-reflect");
    expect(DEVELOPMENT_ATLAS.pathways.find(({ id }) => id === "memory-learning")?.type).toBe("task-practice");
  });

  it("links only known contextual references and records their limitations", () => {
    const referenceIds = new Set(DEVELOPMENT_ATLAS.references.map(({ id }) => id));
    expect(DEVELOPMENT_ATLAS.references.length).toBeGreaterThanOrEqual(8);
    for (const reference of DEVELOPMENT_ATLAS.references) {
      expect(reference.url).toMatch(/^https:\/\//);
      expect(reference.scope).not.toBe("");
      expect(reference.supports).not.toBe("");
      expect(reference.limitation).not.toBe("");
    }
    for (const pathway of DEVELOPMENT_ATLAS.pathways) {
      expect(pathway.referenceIds.every((id) => referenceIds.has(id))).toBe(true);
    }
  });

  it("builds a small plan from known unique choices in the user's chosen order", () => {
    const plan = buildPracticeMenu([
      "social-connection",
      "memory-learning",
      "social-connection",
      "does-not-exist",
      "sleep-recovery",
      "reasoning-decisions",
    ]);

    expect(plan.map(({ id }) => id)).toEqual(["social-connection", "memory-learning", "sleep-recovery"]);
    expect(plan).toHaveLength(MAX_PLANNED_PATHWAYS);
  });

  it("exports only the selected public pathway text, with no schedule or progress score", () => {
    const plan = formatPracticeMenu(buildPracticeMenu(["memory-learning"]));

    expect(plan).toContain("Optional practice menu");
    expect(plan).toContain("Recall · check · revisit");
    expect(plan).toContain("This is not a schedule");
    expect(plan).toContain("not saved by the atlas");
    expect(plan).not.toContain("IQ score");
    expect(formatPracticeMenu([])).toBe("");
  });
});
