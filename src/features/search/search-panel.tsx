"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { SEARCH_INDEX } from "@/features/search/index";
import {
  SEARCH_TYPE_LABELS,
  searchWithGrace,
  suggestAlternativeTerms,
  tokenize,
  type SearchDocType,
} from "@/features/search/query";
import { getRouteByHref } from "@/lib/routes";

const TYPE_ORDER = Object.keys(SEARCH_TYPE_LABELS) as SearchDocType[];
const MIN_QUERY_LENGTH = 2;

/**
 * Search runs entirely in the browser over the content already loaded on this page. Nothing is
 * requested, logged, or stored, and results update as you type. The URL mirrors the query so a
 * result set can be bookmarked or shared.
 */
export function SearchPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const rawQuery = searchParams.get("q") ?? "";
  const rawType = searchParams.get("type") ?? "";
  const activeType: SearchDocType | "all" = (TYPE_ORDER as string[]).includes(rawType)
    ? (rawType as SearchDocType)
    : "all";

  const [value, setValue] = useState(rawQuery);
  const [showAll, setShowAll] = useState(false);

  const query = value.trim();
  const outcome = useMemo(() => searchWithGrace(SEARCH_INDEX, query, { type: activeType, limit: 60 }), [query, activeType]);
  const results = outcome.results;
  const suggestions = useMemo(() => suggestAlternativeTerms(SEARCH_INDEX, 8), []);
  const tokens = useMemo(() => tokenize(query), [query]);
  const visible = showAll ? results : results.slice(0, 12);

  const sync = useCallback(
    (nextQuery: string, nextType: SearchDocType | "all") => {
      const params = new URLSearchParams();
      if (nextQuery.trim().length >= MIN_QUERY_LENGTH) params.set("q", nextQuery.trim());
      if (nextType !== "all") params.set("type", nextType);
      const search = params.toString();
      router.replace(search ? `/search?${search}` : "/search", { scroll: false });
    },
    [router],
  );

  function update(nextValue: string, nextType = activeType) {
    setValue(nextValue);
    setShowAll(false);
    sync(nextValue, nextType);
  }

  function pick(term: string) {
    inputRef.current?.focus();
    update(term);
  }

  return (
    <div className="search-workspace" id="search-workspace">
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          update(value);
          inputRef.current?.blur();
        }}
      >
        <label htmlFor={`${formId}-input`}>Search this space</label>
        <div className="search-controls">
          <input
            id={`${formId}-input`}
            ref={inputRef}
            type="search"
            name="q"
            value={value}
            onChange={(event) => update(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            maxLength={120}
            placeholder="retrieval, focus, sleep, logic, evidence…"
            aria-describedby={`${formId}-help`}
          />
          <label className="search-type" htmlFor={`${formId}-type`}>
            <span>Limit to</span>
            <select
              id={`${formId}-type`}
              value={activeType === "all" ? "" : activeType}
              onChange={(event) => {
                const next = event.target.value === "" ? "all" : (event.target.value as SearchDocType);
                update(value, next);
              }}
            >
              <option value="">Everything</option>
              {TYPE_ORDER.map((type) => (
                <option key={type} value={type}>{SEARCH_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </label>
          <button className="button button-primary" type="submit">Search</button>
          {query || activeType !== "all" ? (
            <button className="button button-quiet" type="button" onClick={() => { setValue(""); update("", "all"); }}>
              Clear
            </button>
          ) : null}
        </div>
        <p className="search-help" id={`${formId}-help`}>
          Two or more letters starts a search. Results containing every word you typed come first; if none do, the closest
          matches are shown and labelled as such. Rarer words count for more than common ones. Nothing is sent anywhere:
          the index is the {SEARCH_INDEX.length} reviewed items already on this page.
        </p>
      </form>

      {query.length < MIN_QUERY_LENGTH ? (
        <div className="search-start" aria-label="Ways to start">
          <p className="mini-label">Popular starting points</p>
          <ul className="chip-row">
            {["forget", "focus", "study", "sleep", "logic", "evidence"].map((term) => (
              <li key={term}>
                <button type="button" className="search-chip" onClick={() => pick(term)}>{term}</button>
              </li>
            ))}
          </ul>
          <nav className="journey-return" aria-label="Browse instead of searching">
            <Link href="/journeys">Choose a guided path</Link>
            <Link href="/explore">Browse concepts</Link>
            <Link href="/train#activities">Browse activities</Link>
            <Link href="/evidence">Open the evidence library</Link>
          </nav>
        </div>
      ) : null}

      <section className="search-results" aria-labelledby="search-results-title">
        <div className="directory-heading">
          <div>
            <p className="mini-label" role="status" aria-live="polite">
              {query.length >= MIN_QUERY_LENGTH
                ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”${outcome.mode === "broader" ? " (closest matches)" : ""}`
                : "Waiting for a word"}
            </p>
            <h2 id="search-results-title">{query.length >= MIN_QUERY_LENGTH ? "Where that leads" : "Search is optional here"}</h2>
            {outcome.mode === "broader" ? (
              <p className="search-mode-note">
                No item contains every word you typed, so these are the nearest matches rather than exact hits. Removing a
                word usually sharpens the list.
              </p>
            ) : null}
          </div>
          <p>
            {query.length >= MIN_QUERY_LENGTH
              ? "Open only what matches what you actually want. A result is a pointer, not a conclusion."
              : "If you would rather look than type, every index page lists the full set: concepts, paths, activities, areas, and evidence."}
          </p>
        </div>

        {query.length >= MIN_QUERY_LENGTH && visible.length > 0 ? (
          <>
            <ul className="result-list">
              {visible.map((result) => {
                const destination = getRouteByHref(result.doc.href);
                return (
                  <li key={result.doc.id}>
                    <article className="result-card">
                      <p className="result-type">
                        {SEARCH_TYPE_LABELS[result.doc.type]}
                        {result.matched.length > 0 ? (
                          <span className="result-matched">
                            matched:{" "}
                            {result.matched.slice(0, 3).map((token) => (
                              <mark key={token} className="search-mark">{token}</mark>
                            ))}
                          </span>
                        ) : null}
                      </p>
                      <h3>
                        <Link href={result.doc.href}>{result.doc.title}</Link>
                      </h3>
                      <p className="result-subtitle">{result.doc.subtitle}</p>
                      <p className="result-excerpt">{result.excerpt}</p>
                      {destination ? (
                        <p className="result-where">
                          <span className="mini-label">What that page is for</span>
                          {destination.purpose}
                        </p>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
            {results.length > visible.length ? (
              <button className="text-button" type="button" onClick={() => setShowAll(true)}>
                Show {results.length - visible.length} more result{results.length - visible.length === 1 ? "" : "s"}
              </button>
            ) : null}
          </>
        ) : null}

        {query.length >= MIN_QUERY_LENGTH && results.length === 0 ? (
          <div className="search-empty">
            <p>
              No indexed item contains {tokens.length > 0 ? tokens.map((token) => `“${token}”`).join(" and ") : "those words"}
              {activeType !== "all" ? ` in the ${SEARCH_TYPE_LABELS[activeType]} filter` : ""}. That says something about
              this small reviewed set, not about your question being unimportant.
            </p>
            <div className="search-suggestions">
              <p className="mini-label">Words this index does cover</p>
              <ul className="chip-row">
                {suggestions.map((term) => (
                  <li key={term}>
                    <button type="button" className="search-chip" onClick={() => pick(term)}>{term}</button>
                  </li>
                ))}
              </ul>
            </div>
            <nav className="journey-return" aria-label="Fallbacks when a search finds nothing">
              {activeType !== "all" ? <button className="text-button" type="button" onClick={() => update(value, "all")}>Search everything instead</button> : null}
              <Link href="/journeys">Choose a guided path</Link>
              <Link href="/develop">Browse the development atlas</Link>
            </nav>
          </div>
        ) : null}
      </section>
    </div>
  );
}
