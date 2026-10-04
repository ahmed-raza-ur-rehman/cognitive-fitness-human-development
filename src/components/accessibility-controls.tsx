"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  applyPreferencesToElement,
  readStoredPreferences,
  sanitizePreferences,
  type Preferences,
} from "@/lib/preferences";

const PREFERENCES_EVENT = "cognitive-fitness-preferences";

function readPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  return readStoredPreferences((key) => window.localStorage.getItem(key));
}

function persist(preferences: Preferences) {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // A blocked or full storage area is a presentation-only failure: the settings still apply for
    // this page view, and no activity data or result is affected by it.
  }
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

function clearStored() {
  try {
    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  } catch {
    // Ignore an inaccessible storage area; defaults are re-applied for this view regardless.
  }
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

type ChoiceKey = "textScale" | "contrast" | "spacing" | "typeface";

const CHOICES: { key: ChoiceKey; legend: string; options: { value: string; label: string; sample?: string }[] }[] = [
  {
    key: "textScale",
    legend: "Text size",
    options: [
      { value: "normal", label: "Comfortable", sample: "Aa" },
      { value: "large", label: "Larger", sample: "Aa" },
      { value: "largest", label: "Largest", sample: "Aa" },
    ],
  },
  {
    key: "contrast",
    legend: "Contrast",
    options: [
      { value: "standard", label: "Standard" },
      { value: "high", label: "Higher" },
    ],
  },
  {
    key: "spacing",
    legend: "Line spacing",
    options: [
      { value: "normal", label: "Standard" },
      { value: "loose", label: "More space" },
    ],
  },
  {
    key: "typeface",
    legend: "Typeface",
    options: [
      { value: "default", label: "This design" },
      { value: "serif", label: "Serif" },
    ],
  },
];

const TOGGLES: { key: "reduceMotion" | "readingGuide" | "highlightLinks"; label: string; help: string }[] = [
  { key: "reduceMotion", label: "Reduce motion", help: "Removes transitions, movement, and smooth scrolling." },
  { key: "readingGuide", label: "Reading guide", help: "Keeps a faint line aligned with your pointer." },
  { key: "highlightLinks", label: "Underline every link", help: "Separates link text inside sentences." },
];

export function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const [announcement, setAnnouncement] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    applyPreferencesToElement(document.documentElement, preferences);
  }, [preferences]);

  useEffect(() => {
    function sync() {
      setPreferences(readPreferences());
    }
    window.addEventListener(PREFERENCES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: Partial<Preferences>, label: string) => {
    setPreferences((current) => {
      const merged = sanitizePreferences({ ...current, ...next });
      applyPreferencesToElement(document.documentElement, merged);
      persist(merged);
      setAnnouncement(`${label} applied.`);
      return merged;
    });
  }, []);

  function closePanel() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, input, select, a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function reset() {
    applyPreferencesToElement(document.documentElement, DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
    clearStored();
    setAnnouncement("Reading options reset to defaults on this device.");
    triggerRef.current?.focus();
  }

  return (
    <div className="accessibility-tools">
      <button
        className="accessibility-trigger"
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">Aa</span>
        <span>Reading options</span>
      </button>
      {open ? (
        <div className="accessibility-panel" id={panelId} ref={panelRef} role="region" aria-labelledby={`${panelId}-title`}>
          <div className="accessibility-panel-heading">
            <div>
              <p className="mini-label">PERSONALIZE PRESENTATION ONLY</p>
              <h2 id={`${panelId}-title`}>Reading options</h2>
            </div>
            <button className="panel-close" type="button" onClick={closePanel} aria-label="Close reading options">×</button>
          </div>
          <p className="accessibility-help">
            These settings stay on this device and change how pages look. They never change an activity&apos;s rules, its
            result, or what that result can support. Press Escape to close.
          </p>

          {CHOICES.map((group) => (
            <fieldset className="preference-group" key={group.key}>
              <legend>{group.legend}</legend>
              <div className="preference-options" role="group" aria-label={group.legend}>
                {group.options.map((option) => {
                  const selected = preferences[group.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={selected ? "preference-option is-selected" : "preference-option"}
                      aria-pressed={selected}
                      onClick={() => update({ [group.key]: option.value } as Partial<Preferences>, `${group.legend}: ${option.label}`)}
                    >
                      {option.sample ? <span className={`size-sample size-${option.value}`} aria-hidden="true">{option.sample}</span> : null}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset className="preference-group">
            <legend>Motion and reading aids</legend>
            {TOGGLES.map((item) => (
              <label className="preference-switch" key={item.key}>
                <span><strong>{item.label}</strong><small>{item.help}</small></span>
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={(event) => update({ [item.key]: event.target.checked } as Partial<Preferences>, item.label)}
                />
              </label>
            ))}
          </fieldset>

          <p className="accessibility-announcement" role="status" aria-live="polite">{announcement}</p>
          <div className="accessibility-panel-footer">
            <button type="button" className="text-button" onClick={reset}>Reset defaults</button>
            <button type="button" className="button button-primary button-small" onClick={closePanel}>Done</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
