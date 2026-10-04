import { describe, expect, it } from "vitest";
import { SEARCH_INDEX, buildSearchIndex } from "@/features/search/index";
import {
  SEARCH_TYPE_LABELS,
  normalizeToken,
  searchDocuments,
  searchWithGrace,
  suggestAlternativeTerms,
  tokenize,
  type SearchDoc,
} from "@/features/search/query";
import { SITE_ROUTES, isKnownHref } from "@/lib/routes";

const fixture: SearchDoc[] = [
  { id: "a", type: "concept", title: "Memory", subtitle: "Keeping and retrieving", body: "One round of recall", keywords: ["learn"], href: "/explore/memory" },
  { id: "b", type: "activity", title: "Sequence Recall", subtitle: "Memory practice", body: "Study a number sequence then recognise it", keywords: ["practice"], href: "/train#activities" },
  { id: "c", type: "claim", title: "Sleep and memory", subtitle: "Population-level review", body: "A review of studies about sleep", keywords: ["review"], href: "/evidence" },
];

describe("search query", () => {
  it("tokenizes without losing accented or hyphenated words", () => {
    expect(tokenize("Why do I forget things?")).toEqual(["forget", "things"]);
    expect(normalizeToken("Retrieval–Practice")).toContain("retrieval");
    expect(tokenize("the a of")).toEqual([]);
  });

  it("needs two characters and ignores stop words", () => {
    expect(searchDocuments(fixture, "m")).toEqual([]);
    expect(searchDocuments(fixture, "the")).toEqual([]);
  });

  it("ranks title matches above body matches and keeps every typed word required", () => {
    const results = searchDocuments(fixture, "memory");
    expect(results[0].doc.id).toBe("a");
    expect(results.length).toBeGreaterThan(1);

    expect(searchDocuments(fixture, "memory zebra")).toHaveLength(3);
    expect(searchWithGrace(fixture, "memory zebra").mode).toBe("broader");
    expect(searchWithGrace(fixture, "memory").mode).toBe("exact");
    expect(searchWithGrace(fixture, "zebra").mode).toBe("empty");
  });

  it("filters by type without inventing results", () => {
    expect(searchDocuments(fixture, "recall", { type: "activity" }).map((r) => r.doc.id)).toEqual(["b"]);
    expect(searchDocuments(fixture, "recall", { type: "claim" })).toEqual([]);
  });

  it("excerpts around the match instead of dumping the whole body", () => {
    const [result] = searchDocuments(fixture, "recognise");
    expect(result).toBeTruthy();
    expect(result.excerpt.length).toBeLessThan(220);
    expect(result.matched).toContain("recognise");
  });
});

describe("search index", () => {
  it("only ever points at registered pages and real anchors", () => {
    const developAnchors = new Set(SITE_ROUTES.find((route) => route.path === "/develop")?.anchors ?? []);
    for (const doc of SEARCH_INDEX) {
      const [pathname, hash] = doc.href.split("#");
      expect(isKnownHref(doc.href), `${doc.id} points at ${doc.href}`).toBe(true);
      if (hash && pathname === "/develop") {
        expect([...developAnchors].some((anchor) => anchor === hash || hash.startsWith("pathway-"))).toBe(true);
      }
      expect(SEARCH_TYPE_LABELS[doc.type]).toBeTruthy();
    }
  });

  it("is deterministic, unique, and covers each content family", () => {
    expect(new Set(SEARCH_INDEX.map((doc) => doc.id)).size).toBe(SEARCH_INDEX.length);
    expect(buildSearchIndex().map((doc) => doc.id)).toEqual(SEARCH_INDEX.map((doc) => doc.id));

    for (const type of ["page", "path", "step", "concept", "claim", "source", "pathway", "activity", "goal", "tool"] as const) {
      expect(SEARCH_INDEX.some((doc) => doc.type === type), `missing ${type} coverage`).toBe(true);
    }
  });

  it("indexes every concept, activity, and path without markup leaking into results", () => {
    const hrefs = new Set(SEARCH_INDEX.map((doc) => doc.href));
    expect(hrefs.has("/explore/memory")).toBe(true);
    expect(hrefs.has("/progress")).toBe(true);
    expect(SEARCH_INDEX.filter((doc) => doc.type === "activity")).toHaveLength(8);
    expect(SEARCH_INDEX.filter((doc) => doc.type === "path")).toHaveLength(6);

    const serialized = JSON.stringify(SEARCH_INDEX);
    for (const leak of ["<div", "className=", "localStorage", "OPENAI_API_KEY"]) {
      expect(serialized).not.toContain(leak);
    }
  });

  it("suggests terms that actually exist when a query finds nothing", () => {
    const suggestions = suggestAlternativeTerms(fixture, 3);
    expect(suggestions.length).toBeGreaterThan(0);
    for (const term of suggestions) {
      expect(searchDocuments(fixture, term).length).toBeGreaterThan(0);
    }
  });
});
