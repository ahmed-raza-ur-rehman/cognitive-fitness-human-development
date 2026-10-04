"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./sleep-opportunity-planner.module.css";

type PlannerResult =
  | { kind: "window"; start: string; day: string; hours: number }
  | { kind: "short-window"; hours: number }
  | { kind: "invalid" };

function parseClockTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function formatClockTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hour12 = hours % 12 || 12;
  const period = hours < 12 ? "AM" : "PM";

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getPlannerResult(wakeTime: string, windowHours: string): PlannerResult | null {
  if (!wakeTime && !windowHours) return null;
  if (!wakeTime || !windowHours) return null;

  const wakeMinutes = parseClockTime(wakeTime);
  const hours = Number(windowHours);
  const validHours = Number.isFinite(hours)
    && hours >= 0.5
    && hours <= 16
    && Number.isInteger(hours * 2);

  if (wakeMinutes === null || !validHours) return { kind: "invalid" };
  if (hours < 7) return { kind: "short-window", hours };

  const rawStartMinutes = wakeMinutes - hours * 60;
  const startMinutes = ((rawStartMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

  return {
    kind: "window",
    start: formatClockTime(startMinutes),
    day: rawStartMinutes < 0 ? "the previous day" : "the same day",
    hours,
  };
}

function formatHours(hours: number): string {
  return `${Number(hours.toFixed(1))} ${hours === 1 ? "hour" : "hours"}`;
}

export function SleepOpportunityPlanner() {
  const [wakeTime, setWakeTime] = useState("");
  const [windowHours, setWindowHours] = useState("");
  const result = getPlannerResult(wakeTime, windowHours);

  return (
    <section
      className={styles.planner}
      id="sleep-opportunity-planner"
      aria-labelledby="sleep-opportunity-planner-title"
    >
      <header className={styles.heading}>
        <p className="section-kicker">Optional / on this page only</p>
        <h2 id="sleep-opportunity-planner-title">Sketch a sleep-opportunity window</h2>
        <p>
          Choose a wake time and a window length to see the clock arithmetic. This is a
          planning sketch—not a bedtime recommendation, sleep measurement, or treatment.
        </p>
      </header>

      <aside className={styles.contextNote} aria-label="Important sleep-guidance context">
        <strong>Keep the units straight.</strong>
        <p>
          The adult consensus benchmark below is about hours actually asleep. A time window
          you reserve can include time spent awake, so it is not the same thing and cannot
          show whether a recommendation is met. The values you enter are yours to choose;
          this tool does not set a personal target.
        </p>
      </aside>

      <div className={styles.form}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="sleep-planner-wake-time">Wake-up time on your local clock</label>
            <input
              autoComplete="off"
              id="sleep-planner-wake-time"
              name="wake-time"
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
              aria-describedby="sleep-planner-wake-help"
            />
            <p className={styles.fieldHelp} id="sleep-planner-wake-help">
              No date or time zone is needed.
            </p>
          </div>

          <div className={styles.field}>
            <label htmlFor="sleep-planner-window-hours">
              Hours you choose to leave open for sleep
            </label>
            <input
              autoComplete="off"
              id="sleep-planner-window-hours"
              name="sleep-window-hours"
              type="number"
              inputMode="decimal"
              min="0.5"
              max="16"
              step="0.5"
              placeholder="For example, 8"
              value={windowHours}
              onChange={(event) => setWindowHours(event.target.value)}
              aria-describedby="sleep-planner-window-help"
            />
            <p className={styles.fieldHelp} id="sleep-planner-window-help">
              Enter 0.5–16 hours in half-hour steps. These are arithmetic limits, not
              recommended sleep durations.
            </p>
          </div>
        </div>

        <div
          className={`${styles.result} ${result?.kind === "short-window" ? styles.warning : ""}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {result?.kind === "window" ? (
            <>
              <strong>Calculated window start</strong>
              <p>
                With a wake time of {wakeTime} and your chosen {formatHours(result.hours)}
                window, the window would start at {result.start} on {result.day}. This is
                clock arithmetic only; it does not tell you how much time you will actually
                sleep.
              </p>
            </>
          ) : result?.kind === "short-window" ? (
            <>
              <strong>Check the window you entered</strong>
              <p>
                A {formatHours(result.hours)} window is shorter than 7 hours. Even if every
                minute were spent asleep, it could not provide the AASM/SRS benchmark of
                seven or more hours of actual sleep for healthy adults aged 18–60. That
                population benchmark may not apply to you, and this tool cannot determine a
                suitable amount.
              </p>
            </>
          ) : result?.kind === "invalid" ? (
            <>
              <strong>Check both entries</strong>
              <p>
                Choose a valid local clock time and enter a window from 0.5 to 16 hours in
                half-hour steps.
              </p>
            </>
          ) : (
            <>
              <strong>Your entries stay optional</strong>
              <p>
                Add both values to view the arithmetic. Nothing is estimated until you do.
              </p>
            </>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.resetButton}
            type="button"
            onClick={() => {
              setWakeTime("");
              setWindowHours("");
            }}
          >
            Clear entries
          </button>
          <p>Your entries stay in this page only; they are not saved or sent. No account or sleep tracking is used.</p>
        </div>
      </div>

      <div className={styles.nextSteps}>
        <h3>Keep recovery connected to the wider pathway</h3>
        <ul>
          <li><Link href="/explore/memory">Return to memory</Link></li>
          <li><Link href="/explore/learning">Explore learning evidence</Link></li>
          <li><Link href="/train#goals">Review an optional, separate practice goal</Link></li>
        </ul>
        <p>
          Sleep choices are not added to training history or a goal. The goals link opens the
          existing practice planner separately.
        </p>
      </div>
    </section>
  );
}
