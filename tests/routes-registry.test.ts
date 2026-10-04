import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import { JOURNEYS } from "@/features/journeys/content";
import { knowledgeGraph } from "@/features/knowledge/content";
import { SITE_ROUTES, getRouteByHref, isKnownHref } from "@/lib/routes";

const appDir = join(process.cwd(), "src", "app");

function pagePaths(dir: string, prefix = ""): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...pagePaths(full, `${prefix}/${entry}`));
      continue;
    }
    if (entry === "page.tsx" || entry === "page.ts") found.push(prefix || "/");
  }
  return found;
}

/** Turns a Next.js folder path into the concrete route the registry should list. */
function concreteRoutes(): string[] {
  const dynamic = new Set<string>();
  const literal: string[] = [];
  for (const path of pagePaths(appDir)) {
    if (!path.includes("[")) {
      literal.push(path);
      continue;
    }
    if (path.startsWith("/explore/[")) dynamic.add(`/explore/${"placeholder"}`);
    if (path.startsWith("/journeys/[")) dynamic.add(`/journeys/${"placeholder"}`);
  }
  const concrete = literal.filter((path) => !path.startsWith("/coach/api"));
  for (const concept of knowledgeGraph.concepts) concrete.push(`/explore/${concept.slug}`);
  for (const journey of JOURNEYS) concrete.push(`/journeys/${journey.slug}`);
  expect(dynamic.size).toBe(2);
  return concrete.sort();
}

describe("route registry", () => {
  it("registers every rendered page with a purpose, an audience, and a direction", () => {
    const registered = new Set(SITE_ROUTES.map((route) => route.path));
    for (const path of concreteRoutes()) {
      expect(registered.has(path), `${path} renders but is not registered`).toBe(true);
    }
  });

  it("refuses a route without meaning", () => {
    for (const route of SITE_ROUTES) {
      expect(route.purpose.length).toBeGreaterThan(30);
      expect(route.audience.length).toBeGreaterThan(3);
      expect(route.leadsTo.length).toBeGreaterThan(0);
      expect(isKnownHref(route.primaryAction.href), `${route.id} primary action must resolve`).toBe(true);
      for (const target of route.leadsTo) {
        expect(getRouteByHref(target), `${route.id} leads to an unknown page`).toBeTruthy();
      }
    }
  });

  it("keeps anchors pointed at elements that actually render", () => {
    for (const route of SITE_ROUTES) {
      for (const anchor of route.anchors ?? []) {
        expect(anchor, `${route.id} anchor must be non-empty`).toMatch(/^[a-z0-9][a-z0-9.-]*$/);
      }
    }
    // The atlas and path pages generate ids from content ids, so those anchors must match real ids.
    const developAnchors = new Set(SITE_ROUTES.find((route) => route.path === "/develop")?.anchors ?? []);
    for (const cluster of DEVELOPMENT_ATLAS.clusters) expect(developAnchors.has(cluster.id)).toBe(true);
    for (const journey of JOURNEYS) {
      const journeyAnchors = new Set(SITE_ROUTES.find((route) => route.path === `/journeys/${journey.slug}`)?.anchors ?? []);
      for (const step of journey.steps) expect(journeyAnchors.has(`step-${step.id}`), `missing anchor for ${step.id}`).toBe(true);
    }
  });

  it("leaves no area unreachable through the registry that pages render", () => {
    const linked = new Set<string>(["/"]); // the brand link in the header
    for (const route of SITE_ROUTES) {
      linked.add(route.primaryAction.href.split("#")[0]);
      for (const target of route.leadsTo) linked.add(target.split("#")[0]);
    }
    for (const path of ["/journeys", "/explore", "/develop", "/train", "/lab", "/evidence", "/progress", "/coach", "/search", "/privacy"]) {
      expect(linked.has(path), `${path} cannot be reached from any registered page`).toBe(true);
    }
  });
});
