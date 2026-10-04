"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { TRAINING_STORAGE_KEY } from "@/features/training/training-engine";
import { formatFraction, parsePracticeState, summarizePractice } from "@/features/progress/practice-analytics";
import styles from "./progress.module.css";

const TRAINING_STORE_EVENT = "cognitive-fitness-training-store";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TRAINING_STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TRAINING_STORE_EVENT, onChange);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(TRAINING_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function formatDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ProgressPanel() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const summary = summarizePractice(parsePracticeState(raw));

  if (!summary || summary.totalSessions === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyHeading}>Nothing is saved on this device yet.</p>
        <p>
          This page can only describe sessions you chose to keep. <strong>My practice</strong> reads the same local
          records the training hub writes when you turn on <em>Save this goal on this device</em>; if that switch is off,
          sessions live in the page until you reload and nothing appears here.
        </p>
        <nav className={styles.emptyLinks} aria-label="Ways to begin">
          <Link className="button button-primary" href="/train#active-training">Turn on local saving</Link>
          <Link className="button button-quiet" href="/train#activities">Browse the eight activities</Link>
          <Link className="button button-quiet" href="/journeys/start-here">Take the ten-minute orientation</Link>
        </nav>
        <p className={styles.emptyNote}>
          No account, upload, or history is required — and this page cannot show what happened in another browser or on
          another device.
        </p>
      </div>
    );
  }

  const maxWeekSessions = Math.max(1, ...summary.weeks.map((week) => week.sessions));
  const maxDistribution = Math.max(1, ...summary.activities.flatMap((activity) => activity.distribution));

  return (
    <div className={styles.panel}>
      <section className={styles.overview} aria-labelledby="progress-overview-title">
        <h2 id="progress-overview-title">What is on this device</h2>
        <dl className={styles.factGrid}>
          <div>
            <dt>Saved sessions</dt>
            <dd>{summary.totalSessions}</dd>
          </div>
          <div>
            <dt>Items answered</dt>
            <dd>{summary.totalItems}</dd>
          </div>
          <div>
            <dt>Practice / challenge</dt>
            <dd>{summary.practiceSessions} / {summary.challengeSessions}</dd>
          </div>
          <div>
            <dt>Date range</dt>
            <dd>{formatDay(summary.firstCompletedAt)} → {formatDay(summary.lastCompletedAt)}</dd>
          </div>
          <div>
            <dt>Activities touched</dt>
            <dd>{summary.activities.length} of 8</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{summary.goalName ?? "No goal selected"}</dd>
          </div>
        </dl>
        <p className={styles.overviewNote}>
          {summary.correctItems} of {summary.totalItems} items were recorded as correct across these saved sessions. That
          is a count of what the stored records say — not a score of ability, and not comparable to anyone else&apos;s
          sessions or item sets.
        </p>
      </section>

      {summary.goalName ? (
        <section className={styles.goalBlock} aria-labelledby="progress-goal-title">
          <div>
            <p className={styles.miniLabel}>The schedule you chose</p>
            <h2 id="progress-goal-title">{summary.goalName}</h2>
            <p>
              {summary.currentWeek && summary.durationWeeks
                ? `Week ${summary.currentWeek} of ${summary.durationWeeks}${summary.programIsPaused ? " · paused" : ""}${summary.programIsComplete ? " · schedule complete" : ""}.`
                : "A schedule is selected on this device."}{" "}
              {summary.goalWeekTarget
                ? `You set a target of ${summary.goalWeekTarget} sessions this week; ${summary.sessionsThisWeekForGoal} matching ${summary.sessionsThisWeekForGoal === 1 ? "session is" : "sessions are"} recorded so far, counting only the ${summary.goalActivityCount ?? 0} activities this goal includes.`
                : ""}
            </p>
          </div>
          <p className={styles.goalBoundary}>
            Adherence counts the sessions you kept and their game belonging to the goal. It is separate from task
            results and is not a measure of discipline, health, or cognitive change.
          </p>
          <Link className="text-link" href="/train#active-training">Adjust, pause, or stop the schedule <span aria-hidden="true">→</span></Link>
        </section>
      ) : null}

      <section className={styles.activitySection} aria-labelledby="progress-activities-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.miniLabel}>PER ACTIVITY — NEVER POOLED</p>
            <h2 id="progress-activities-title">Each task keeps its own numbers</h2>
          </div>
          <p>
            Range and median describe the saved rounds only. Different item sets and difficulty are not controlled, so a
            rising line here is not a measured improvement.
          </p>
        </div>

        <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.visuallyHidden}>
            Saved sessions per activity with session counts, item counts, the lowest, middle, and highest correct
            fraction, and the last date recorded.
          </caption>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Sessions</th>
              <th scope="col">Items</th>
              <th scope="col">Lowest</th>
              <th scope="col">Median</th>
              <th scope="col">Highest</th>
              <th scope="col">Spread</th>
              <th scope="col">Last saved</th>
            </tr>
          </thead>
          <tbody>
            {summary.activities.map((activity) => (
              <tr key={activity.activityId}>
                <th scope="row">
                  <span>{activity.name}</span>
                  <small>{activity.domain}</small>
                </th>
                <td>{activity.sessions}</td>
                <td>{activity.items}</td>
                <td>{formatFraction(activity.lowestFraction)}</td>
                <td>{formatFraction(activity.medianFraction)}</td>
                <td>{formatFraction(activity.highestFraction)}</td>
                <td>
                  <span className={styles.distribution} role="img" aria-label={`${activity.name}: distribution of correct items per session across ${activity.sessions} sessions`}>
                    {activity.distribution.map((count, correct) => (
                      <span
                        key={correct}
                        className={styles.distBar}
                        style={{ height: `${Math.max(6, Math.round((count / maxDistribution) * 100))}%` }}
                        title={`${correct} correct in ${count} session${count === 1 ? "" : "s"}`}
                      >
                        <span className={styles.visuallyHidden}>{correct} correct in {count} session{count === 1 ? "" : "s"}. </span>
                      </span>
                    ))}
                  </span>
                </td>
                <td>{formatDay(activity.lastCompletedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <section className={styles.weekSection} aria-labelledby="progress-weeks-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.miniLabel}>CADENCE, NOT STREAKS</p>
            <h2 id="progress-weeks-title">Sessions per UTC week</h2>
          </div>
          <p>
            Weeks are counted in UTC and shown only when they contain a saved session. A gap is a gap: nothing here
            penalises you, and returning is always allowed.
          </p>
        </div>
        <ul className={styles.weekChart}>
          {summary.weeks.map((week) => (
            <li key={week.weekKey}>
              <span className={styles.weekBar} style={{ width: `${Math.max(4, Math.round((week.sessions / maxWeekSessions) * 100))}%` }} aria-hidden="true" />
              <span className={styles.weekLabel}>Week of {week.label}</span>
              <span className={styles.weekValue}>{week.sessions} session{week.sessions === 1 ? "" : "s"} · {week.items} items</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.readSection} aria-labelledby="progress-read-title">
        <div>
          <p className={styles.miniLabel}>HOW TO READ THIS</p>
          <h2 id="progress-read-title">Three things these numbers cannot say</h2>
        </div>
        <ol className={styles.readList}>
          <li>
            <strong>They do not measure change in ability.</strong> Item sets, difficulty, and testing conditions are not
            controlled between sessions, so a difference between two weeks may be practice effects, familiarity, or mood.
          </li>
          <li>
            <strong>They do not transfer.</strong> A better count in one task has not been shown here to improve memory,
            attention, study, work, or everyday life.
          </li>
          <li>
            <strong>They are not comparable across devices or people.</strong> Only the sessions saved in this browser are
            included; friend challenge results remain self-reported and unverified.
          </li>
        </ol>
        <nav className={styles.readLinks} aria-label="Next steps from the practice overview">
          <Link href="/evidence#activity-boundary">Why a task score stays a task score</Link>
          <Link href="/train#active-training">Export or clear these records</Link>
          <Link href="/privacy">What is stored, and where</Link>
        </nav>
      </section>
    </div>
  );
}
