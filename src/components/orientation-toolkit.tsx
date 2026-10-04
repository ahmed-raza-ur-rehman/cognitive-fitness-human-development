"use client";

import Link from "next/link";
import { useState } from "react";
import { getRouteByHref } from "@/lib/routes";

/**
 * The one place a first-time reader decides what they want today. Four intents, each matched to
 * the area built for that intent — no quiz, no profile, and no claim about what you need.
 */
const intents = [
  {
    id: "curious",
    label: "I want to understand something",
    detail: "Read one reviewed concept and the ideas it connects to. Nothing to finish.",
    href: "/explore",
    action: "Open the concept map",
    tone: "mint",
  },
  {
    id: "practice",
    label: "I want to practise a task",
    detail: "Eight untimed activities, each with visible rules, deterministic scoring, and its limits.",
    href: "/train#activities",
    action: "Choose an activity",
    tone: "lavender",
  },
  {
    id: "led",
    label: "I want to be shown the way",
    detail: "A guided path orders explanation, a demonstration, evidence, and one next action.",
    href: "/journeys",
    action: "Pick a path",
    tone: "amber",
  },
  {
    id: "wider",
    label: "I want the bigger picture",
    detail: "The atlas covers emotion, social life, sleep, movement, habits, and development across life.",
    href: "/develop",
    action: "Browse 14 areas",
    tone: "blue",
  },
] as const;

export function IntentChooser() {
  const [focused, setFocused] = useState<string>(intents[0].id);
  const active = intents.find((intent) => intent.id === focused) ?? intents[0];

  return (
    <section className="intent-chooser" aria-labelledby="intent-chooser-title">
      <p className="visually-hidden" id="intent-chooser-help">Each card opens the area built for that intent.</p>
      <div className="intent-heading">
        <div>
          <p className="section-kicker">One decision, then you are in</p>
          <h2 id="intent-chooser-title">What brought you here today?</h2>
        </div>
        <p className="intent-subheading">
          Choose the closest one. You can change your mind at any point; nothing tracks a wrong turn, and there is no
          sequence you have to complete.
        </p>
      </div>

      <div className="intent-grid">
        {intents.map((intent) => (
          <Link
            key={intent.id}
            href={intent.href}
            className={`intent-card intent-card-${intent.tone}${intent.id === active.id ? " is-active" : ""}`}
            onMouseEnter={() => setFocused(intent.id)}
            onFocus={() => setFocused(intent.id)}
          >
            <strong>{intent.label}</strong>
            <span>{intent.detail}</span>
            <span className="intent-card-go" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <p className="intent-detail">
        <span className="mini-label">Where that goes</span>
        <strong>{active.action}</strong>
        <span className="intent-detail-purpose">{getRouteByHref(active.href)?.purpose}</span>
        <Link href={active.href}>
          {getRouteByHref(active.href)?.label ?? "Open"} <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}

const parts = [
  { id: "explore", name: "Explore", job: "Explains one idea and its labelled connections.", href: "/explore" },
  { id: "journeys", name: "Paths", job: "Orders the areas below around a single question.", href: "/journeys" },
  { id: "lab", name: "Lab", job: "Gives you one experience to interpret.", href: "/lab" },
  { id: "evidence", name: "Evidence", job: "States what research supports, and where it stops.", href: "/evidence" },
  { id: "train", name: "Train", job: "Offers defined practice with deterministic results.", href: "/train" },
  { id: "progress", name: "My practice", job: "Describes saved sessions without combining them.", href: "/progress" },
  { id: "develop", name: "Develop", job: "Places cognition inside a whole-person context.", href: "/develop" },
  { id: "coach", name: "Guide", job: "An optional doorway into any of the above.", href: "/coach" },
] as const;

/** The structure claim made visible: every area has one job, and the reader can see the whole set. */
export function SystemMap() {
  return (
    <section className="system-map" aria-labelledby="system-map-title">
      <div className="system-map-heading">
        <div>
          <p className="section-kicker">Structure you can see</p>
          <h2 id="system-map-title">Eight areas, one system, no hidden hierarchy.</h2>
        </div>
        <p>
          Each area does exactly one kind of work, and each page says where it hands off. Nothing here is a course you
          must complete; the connections exist so you can follow one instead of guessing.
        </p>
      </div>
      <ol className="system-list" aria-label="Eight areas of the product">
        {parts.map((part, index) => (
          <li key={part.id}>
            <span className="system-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="system-copy">
              <strong>{part.name}</strong>
              <span>{part.job}</span>
            </span>
            <Link href={part.href}>Open <span aria-hidden="true">→</span></Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ReadingPromise() {
  return (
    <div className="reading-promise" role="note">
      <span className="reading-promise-symbol" aria-hidden="true">i</span>
      <div>
        <strong>Take your time.</strong>
        <span>Nothing here is timed unless a page explicitly says so. You can pause, skip, or leave any activity, and reading options in the header change presentation only.</span>
      </div>
    </div>
  );
}
