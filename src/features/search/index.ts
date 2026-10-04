import { knowledgeGraph } from "@/features/knowledge/content";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import { JOURNEYS } from "@/features/journeys/content";
import { ACTIVITIES } from "@/features/training/training-engine";
import { GOAL_PROGRAMS } from "@/features/goals/programs";
import { SITE_ROUTES } from "@/lib/routes";
import type { SearchDoc } from "./query";

/**
 * The index is built from the same structured content the pages render, so a search result can
 * never point at something the product does not actually show. Nothing here is user data.
 */
export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const route of SITE_ROUTES) {
    docs.push({
      id: `route.${route.id}`,
      type: "page",
      title: route.label,
      subtitle: route.purpose,
      body: `Written for ${route.audience}. Next steps from here: ${route.leadsTo.join(", ")}.`,
      href: route.path,
      keywords: [route.kind, route.id.replaceAll("-", " ")],
    });
  }

  for (const journey of JOURNEYS) {
    docs.push({
      id: journey.id,
      type: "path",
      title: journey.title,
      subtitle: `Guided path · ${journey.steps.length} steps · about ${journey.minutes} minutes`,
      body: `${journey.summary} What you take with you: ${journey.outcome} Limit: ${journey.boundary}`,
      href: `/journeys/${journey.slug}`,
      keywords: ["guided path", "journey", journey.question, journey.audience],
    });

    journey.steps.forEach((step, index) => {
      docs.push({
        id: step.id,
        type: "step",
        title: `${index + 1}. ${step.title}`,
        subtitle: `${journey.title} · ${step.kind}`,
        body: `${step.purpose} Do this: ${step.action} You leave with: ${step.takeaway} It cannot show: ${step.caution}`,
        href: `/journeys/${journey.slug}#step-${step.id}`,
        keywords: [journey.title, step.kind, "guided path"],
      });
    });
  }

  for (const concept of knowledgeGraph.concepts) {
    docs.push({
      id: concept.id,
      type: "concept",
      title: concept.title,
      subtitle: concept.summary,
      body: `${concept.summary} Follow the reviewed claims on this page and their stated limits.`,
      href: `/explore/${concept.slug}`,
      keywords: ["concept", "explain", "learn"],
    });
  }

  for (const claim of knowledgeGraph.claims) {
    const owner = knowledgeGraph.concepts.find((concept) => concept.claimIds.includes(claim.id));
    docs.push({
      id: claim.id,
      type: "claim",
      title: claim.title,
      subtitle: claim.evidenceLabel,
      body: `${claim.wording} Population: ${claim.population}. Outcome: ${claim.outcome}. Design: ${claim.studyDesign}. Transfer level: ${claim.transferLevel}.`,
      href: owner ? `/explore/${owner.slug}` : "/evidence",
      keywords: ["claim", "evidence", claim.kind, claim.grade, claim.transferLevel],
    });
  }

  for (const source of knowledgeGraph.evidenceSources) {
    docs.push({
      id: source.id,
      type: "source",
      title: source.title,
      subtitle: `${source.publication}, ${source.year} · reviewed ${source.reviewedAt}`,
      body: `${source.sourceType}. ${source.reviewNote}`,
      href: "/evidence",
      keywords: ["study", "source", "paper", ...source.authors.slice(0, 2)],
    });
  }

  for (const reference of DEVELOPMENT_ATLAS.references) {
    docs.push({
      id: `atlas.${reference.id}`,
      type: "source",
      title: reference.title,
      subtitle: `${reference.publisher}, ${reference.year} · ${reference.sourceType}`,
      body: `Scope: ${reference.scope} What it supports: ${reference.supports} Limit: ${reference.limitation}`,
      href: "/evidence",
      keywords: ["atlas source", reference.sourceType],
    });
  }

  for (const pathway of DEVELOPMENT_ATLAS.pathways) {
    docs.push({
      id: `pathway.${pathway.id}`,
      type: "pathway",
      title: pathway.title,
      subtitle: pathway.typeLabel,
      body: `${pathway.summary} Offer: ${pathway.offer} Starter: ${pathway.starter.title} (${pathway.starter.timeHint}). Limit: ${pathway.boundary}`,
      href: `/develop#pathway-${pathway.id}`,
      keywords: ["development atlas", pathway.clusterId, pathway.type, ...pathway.topics],
    });
  }

  for (const activity of ACTIVITIES) {
    docs.push({
      id: `activity.${activity.id}`,
      type: "activity",
      title: activity.name,
      subtitle: `${activity.domain} · about ${activity.minutes} minutes · untimed`,
      body: `${activity.description} Practice focus: ${activity.practiceFocus}. ${activity.evidenceNote}`,
      href: "/train#activities",
      keywords: ["practice", "training", activity.domain, activity.id.replaceAll("-", " "), "untimed"],
    });
  }

  for (const program of GOAL_PROGRAMS) {
    docs.push({
      id: `goal.${program.id}`,
      type: "goal",
      title: program.name,
      subtitle: `${program.durationWeeks}-week schedule · ${program.weeklyTarget} sessions a week`,
      body: `${program.purpose} ${program.description} Review prompt: ${program.reviewPrompt}`,
      href: "/train#active-training",
      keywords: ["goal", "schedule", "program", program.id],
    });
  }

  for (const activity of knowledgeGraph.activities) {
    docs.push({
      id: `tool.${activity.id}`,
      type: "tool",
      title: activity.title,
      subtitle: activity.routePath,
      body: `${activity.purpose} Procedure: ${activity.procedureSummary} It does not measure: ${activity.notMeasures.join(", ")}.`,
      href: activity.routePath,
      keywords: ["demonstration", "experiment", "tool", activity.slug.replaceAll("-", " ")],
    });
  }

  docs.push({
    id: "tool.practice-menu",
    type: "tool",
    title: "Practice menu",
    subtitle: "Optional, temporary shortlist on the atlas page",
    body: "Choose up to three development areas and get a try, apply, and notice sequence. Selections stay on the page and disappear on reload; nothing is saved.",
    href: "/develop#practice-menu",
    keywords: ["plan", "menu", "practice", "atlas"],
  });

  return docs;
}

export const SEARCH_INDEX = buildSearchIndex();
