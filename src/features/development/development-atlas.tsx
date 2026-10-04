"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./development-atlas.module.css";
import {
  DEVELOPMENT_ATLAS,
  MAX_PLANNED_PATHWAYS,
  PATHWAY_TYPE_LABELS,
  type DevelopmentPathway,
} from "@/features/development/content";
import { buildPracticeMenu, formatPracticeMenu } from "@/features/development/practice-menu";

function ResourceLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("/")) {
    return <Link href={href}>{label}</Link>;
  }

  if (href.startsWith("#")) {
    return <a href={href}>{label}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label} <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  );
}

function PathwayCard({
  pathway,
  selected,
  selectionFull,
  onToggle,
}: {
  pathway: DevelopmentPathway;
  selected: boolean;
  selectionFull: boolean;
  onToggle: (pathway: DevelopmentPathway) => void;
}) {
  return (
    <article className={styles.pathwayCard} id={`pathway-${pathway.id}`} aria-labelledby={`title-${pathway.id}`}>
      <div className={styles.cardEyebrow}>
        <span className={styles.typeBadge}>{PATHWAY_TYPE_LABELS[pathway.type]}</span>
        <span className={styles.topicCount}>{pathway.topics.length} topic areas</span>
      </div>
      <h3 id={`title-${pathway.id}`}>{pathway.title}</h3>
      <p className={styles.summary}>{pathway.summary}</p>

      <ul className={styles.topicList} aria-label={`Topics in ${pathway.title}`}>
        {pathway.topics.map((topic) => <li key={topic}>{topic}</li>)}
      </ul>

      <section className={styles.offerBlock} aria-label={`What Cognitive Fitness can offer for ${pathway.title}`}>
        <h4>What this space can offer</h4>
        <p>{pathway.offer}</p>
      </section>

      <section className={styles.starterBlock} aria-label={`Starter practice for ${pathway.title}`}>
        <div className={styles.starterHeading}>
          <h4>{pathway.starter.title}</h4>
          <span>{pathway.starter.timeHint}</span>
        </div>
        <ol>
          {pathway.starter.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <dl className={styles.reflectionGrid}>
        <div>
          <dt>Apply or find support</dt>
          <dd>{pathway.apply}</dd>
        </div>
        <div>
          <dt>Notice, without scoring yourself</dt>
          <dd>{pathway.notice}</dd>
        </div>
      </dl>

      <p className={styles.boundary}>
        <strong>What this does not show:</strong> {pathway.boundary}
      </p>

      <nav className={styles.pathwayLinks} aria-label={`Related resources for ${pathway.title}`}>
        {pathway.links.map((resource) => (
          <ResourceLink key={`${resource.href}:${resource.label}`} href={resource.href} label={resource.label} />
        ))}
      </nav>

      <details className={styles.sourceDetails}>
        <summary>Sources and evidence boundaries</summary>
        <p>{pathway.evidenceNote}</p>
        {pathway.referenceIds.length > 0 ? (
          <ul className={styles.sourceList}>
            {pathway.referenceIds.map((referenceId) => {
              const reference = DEVELOPMENT_ATLAS.references.find((item) => item.id === referenceId);
              if (!reference) return null;
              return (
                <li key={reference.id}>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.title} ({reference.year}) <span className="visually-hidden">(opens in a new tab)</span>
                  </a>
                  <p><strong>Scope:</strong> {reference.scope}</p>
                  <p><strong>What it supports:</strong> {reference.supports}</p>
                  <p><strong>Limit:</strong> {reference.limitation}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No new external efficacy claim is made here. Follow the linked reviewed pathway for its sources.</p>
        )}
      </details>

      <button
        className={styles.planToggle}
        type="button"
        aria-pressed={selected}
        aria-label={`${selected ? "Remove" : "Add"} ${pathway.title} ${selected ? "from" : "to"} the practice menu`}
        aria-describedby={selectionFull && !selected ? "practice-menu-limit" : undefined}
        disabled={selectionFull && !selected}
        onClick={() => onToggle(pathway)}
      >
        <span aria-hidden="true">{selected ? "−" : "+"}</span>
        {selected ? "Remove from menu" : "Add to practice menu"}
      </button>
    </article>
  );
}

export function DevelopmentAtlas() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const selectedPathways = buildPracticeMenu(selectedIds);
  const selectionFull = selectedPathways.length >= MAX_PLANNED_PATHWAYS;
  const planText = formatPracticeMenu(selectedPathways);

  function togglePathway(pathway: DevelopmentPathway) {
    setCopyFallback(false);
    if (selectedIds.includes(pathway.id)) {
      const next = selectedIds.filter((id) => id !== pathway.id);
      setSelectedIds(next);
      setStatus(`${pathway.title} removed. ${next.length} of ${MAX_PLANNED_PATHWAYS} areas selected.`);
      return;
    }

    if (selectionFull) {
      setStatus(`The practice menu has room for up to ${MAX_PLANNED_PATHWAYS} areas. Remove one before adding another.`);
      return;
    }

    const next = [...selectedIds, pathway.id];
    setSelectedIds(next);
    setStatus(`${pathway.title} added. ${next.length} of ${MAX_PLANNED_PATHWAYS} areas selected.`);
  }

  async function copyMenu() {
    setCopyFallback(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable");
      await navigator.clipboard.writeText(planText);
      setStatus("Practice menu copied. It was not saved by this page.");
    } catch {
      setCopyFallback(true);
      setStatus("Clipboard access is unavailable. The plan text is ready to select and copy manually.");
    }
  }

  function clearMenu() {
    setSelectedIds([]);
    setCopyFallback(false);
    setStatus("Practice menu cleared. No selections were saved by this page.");
  }

  return (
    <div className={styles.atlas}>
      <section className={styles.orientation} aria-labelledby="how-to-use-title">
        <div>
          <p className={styles.sectionLabel}>A whole-person map</p>
          <h2 id="how-to-use-title">One person, many interacting parts.</h2>
          <p>
            Some skills can be practised on a defined task. Other areas are better approached through
            learning, reflection, support, or health context. The atlas keeps those offers separate—
            and never turns them into one score.
          </p>
        </div>
        <div className={styles.processList} aria-label="A flexible way to use a pathway">
          <span><b>01</b> Understand</span>
          <span><b>02</b> Try or support</span>
          <span><b>03</b> Apply if useful</span>
          <span><b>04</b> Reflect, adapt, or stop</span>
        </div>
      </section>

      <aside className={styles.practiceMenu} id="practice-menu" aria-labelledby="practice-menu-title">
        <div className={styles.menuHeading}>
          <div>
            <p className={styles.sectionLabel}>Optional / private by default</p>
            <h2 id="practice-menu-title">Make a small practice menu.</h2>
            <p>
              Choose up to {MAX_PLANNED_PATHWAYS} areas. The menu gives you a flexible “try, apply, notice”
              sequence—not a schedule, health prescription, streak, or promise of improvement.
            </p>
          </div>
          <p className={styles.selectionCount} aria-label={`${selectedPathways.length} of ${MAX_PLANNED_PATHWAYS} areas selected`}>
            <strong>{selectedPathways.length}</strong>
            <span>of {MAX_PLANNED_PATHWAYS}<br />selected</span>
          </p>
        </div>

        <p className={styles.privacyNote}>Selections stay in this page session and disappear on reload. No reflection or health details are requested or stored. Copying the generated public pathway text is your choice.</p>
        <p className={styles.limitNote} id="practice-menu-limit">Choose up to three areas. There is no required number of sessions; when three are selected, remove one before adding another.</p>

        {selectedPathways.length > 0 ? (
          <ol className={styles.planList}>
            {selectedPathways.map((pathway) => (
              <li key={pathway.id}>
                <h3>{pathway.title}</h3>
                <p><strong>Try:</strong> {pathway.starter.title}</p>
                <ol>
                  {pathway.starter.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <p><strong>Apply:</strong> {pathway.apply}</p>
                <p><strong>Notice:</strong> {pathway.notice}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyPlan}>Your menu is empty. Browse the areas below and add one if you want a reminder of a practice to try.</p>
        )}

        {copyFallback && selectedPathways.length > 0 ? (
          <label className={styles.copyFallback}>
            Plan text to select and copy
            <textarea readOnly rows={12} value={planText} />
          </label>
        ) : null}

        <div className={styles.menuActions}>
          {selectedPathways.length > 0 ? (
            <button type="button" className={styles.copyButton} onClick={copyMenu}>Copy practice menu</button>
          ) : null}
          <button type="button" className={styles.clearButton} onClick={clearMenu}>Clear menu</button>
        </div>
        <p className={styles.liveStatus} role="status" aria-live="polite">{status}</p>
      </aside>

      <nav className={styles.clusterNav} aria-label="Development areas">
        <p>Jump to an area</p>
        {DEVELOPMENT_ATLAS.clusters.map((cluster) => (
          <a key={cluster.id} href={`#${cluster.id}`}>{cluster.title}</a>
        ))}
      </nav>

      <section className={styles.clusterList} id="pathways" aria-label="All development pathways">
        {DEVELOPMENT_ATLAS.clusters.map((cluster) => {
          const pathways = DEVELOPMENT_ATLAS.pathways.filter((pathway) => pathway.clusterId === cluster.id);
          return (
            <section className={styles.clusterSection} key={cluster.id} id={cluster.id} aria-labelledby={`${cluster.id}-title`}>
              <div className={styles.clusterHeading}>
                <div>
                  <p className={styles.sectionLabel}>Development area</p>
                  <h2 id={`${cluster.id}-title`}>{cluster.title}</h2>
                </div>
                <p>{cluster.summary}</p>
              </div>
              <div className={styles.pathwayGrid}>
                {pathways.map((pathway) => (
                  <PathwayCard
                    key={pathway.id}
                    pathway={pathway}
                    selected={selectedIds.includes(pathway.id)}
                    selectionFull={selectionFull}
                    onToggle={togglePathway}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      <section className={styles.nextSteps} aria-labelledby="next-steps-title">
        <div>
          <p className={styles.sectionLabel}>Keep the distinction clear</p>
          <h2 id="next-steps-title">Practice is one tool—not a verdict about you.</h2>
          <p>
            Task results describe the task. Health foundations describe context. Learning and reflection
            help you explore questions. They are connected parts of life, but they are not
            interchangeable measures.
          </p>
        </div>
        <div className={styles.nextLinks}>
          <Link href="/explore">Open Explore</Link>
          <Link href="/train#activities">Browse task practice</Link>
          <Link href="/evidence">Inspect evidence</Link>
        </div>
      </section>
    </div>
  );
}
