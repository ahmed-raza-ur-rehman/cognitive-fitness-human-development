/**
 * A tiny, dependency-free search over the product's own structured content.
 *
 * It is intentionally deterministic: the same query always returns the same ranking, no
 * network request happens, and nothing about the search is stored. Every result is a real
 * page or content object that the rest of the product renders.
 */

export type SearchDocType =
  | "page"
  | "path"
  | "step"
  | "concept"
  | "claim"
  | "source"
  | "pathway"
  | "activity"
  | "goal"
  | "tool";

export type SearchDoc = {
  id: string;
  type: SearchDocType;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  keywords: string[];
};

export type SearchResult = {
  doc: SearchDoc;
  score: number;
  matched: string[];
  excerpt: string;
};

export const SEARCH_TYPE_LABELS: Record<SearchDocType, string> = {
  page: "Page",
  path: "Guided path",
  step: "Path step",
  concept: "Concept",
  claim: "Evidence claim",
  source: "Source",
  pathway: "Development area",
  activity: "Practice activity",
  goal: "Goal schedule",
  tool: "Tool",
};

const TYPE_WEIGHTS: Record<SearchDocType, number> = {
  path: 1.2,
  page: 1.15,
  concept: 1.1,
  activity: 1.05,
  pathway: 1,
  step: 0.95,
  claim: 0.95,
  tool: 0.95,
  goal: 0.9,
  source: 0.85,
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for", "from", "had", "has", "have",
  "how", "i", "if", "in", "into", "is", "it", "its", "me", "my", "not", "of", "on", "or", "so", "than", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "to", "was", "we", "were", "what", "when",
  "which", "why", "will", "with", "would", "you", "your",
]);

export function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'-]+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  return normalizeToken(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function excerptAround(body: string, tokens: string[]): string {
  const lower = body.toLowerCase();
  let index = -1;
  let hit = "";
  for (const token of tokens) {
    const found = lower.indexOf(token);
    if (found >= 0 && (index === -1 || found < index)) {
      index = found;
      hit = token;
    }
  }
  if (index === -1) return body.slice(0, 168).trimEnd() + (body.length > 168 ? "…" : "");

  const start = Math.max(0, index - 60);
  const end = Math.min(body.length, index + Math.max(108, hit.length + 60));
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

function fieldScore(haystack: string, tokens: string[], weight: number, prefixOnly = false): number {
  let score = 0;
  for (const token of tokens) {
    if (prefixOnly) {
      if (haystack.includes(token)) score += weight;
      continue;
    }
    const exact = new RegExp(`(^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(haystack);
    const partial = haystack.includes(token);
    if (exact) score += weight;
    else if (partial) score += weight * 0.55;
  }
  return score;
}

export function searchDocuments(
  docs: readonly SearchDoc[],
  rawQuery: string,
  options: { type?: SearchDocType | "all"; limit?: number } = {},
): SearchResult[] {
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const phrase = normalizeToken(query);
  const limit = options.limit ?? 24;
  const scoped = options.type && options.type !== "all" ? docs.filter((doc) => doc.type === options.type) : docs;

  const scored: SearchResult[] = [];
  for (const doc of scoped) {
    const title = normalizeToken(doc.title);
    const subtitle = normalizeToken(doc.subtitle);
    const body = normalizeToken(`${doc.subtitle} ${doc.body}`);
    const keywords = normalizeToken(doc.keywords.join(" "));

    const matched = tokens.filter((token) => title.includes(token) || body.includes(token) || keywords.includes(token));
    if (matched.length === 0) continue;

    let score =
      fieldScore(title, tokens, 6) +
      fieldScore(subtitle, tokens, 2) +
      fieldScore(body, tokens, 1) +
      fieldScore(keywords, tokens, 2.5, true);

    if (title === phrase || normalizeToken(doc.title).startsWith(phrase)) score += 8;
    score *= 0.6 + 0.4 * (matched.length / tokens.length);
    score *= TYPE_WEIGHTS[doc.type] ?? 1;

    scored.push({ doc, score: Math.round(score * 100) / 100, matched, excerpt: excerptAround(`${doc.subtitle} ${doc.body}`.trim(), matched) });
  }

  return scored
    .sort((first, second) => second.score - first.score || first.doc.title.localeCompare(second.doc.title))
    .slice(0, limit);
}

export type SearchMode = "exact" | "broader" | "empty";

/**
 * Prefer results that contain every typed word. If nothing does, return the closest matches and
 * say so, rather than showing an empty page for a query that is one word away from useful.
 */
export function searchWithGrace(
  docs: readonly SearchDoc[],
  rawQuery: string,
  options: { type?: SearchDocType | "all"; limit?: number } = {},
): { mode: SearchMode; results: SearchResult[]; tokens: string[] } {
  const results = searchDocuments(docs, rawQuery, options);
  const tokens = tokenize(rawQuery);
  if (results.length === 0) return { mode: "empty", results: [], tokens };

  const exact = results.filter((result) => tokens.every((token) => result.matched.includes(token)));
  return exact.length > 0 ? { mode: "exact", results: exact, tokens } : { mode: "broader", results, tokens };
}

/** A short, honest nudge when a query finds nothing, built from the index itself. */
export function suggestAlternativeTerms(docs: readonly SearchDoc[], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const doc of docs) {
    for (const token of tokenize(doc.title)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([token, count]) => token.length > 3 && count >= 2)
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, limit)
    .map(([token]) => token);
}
