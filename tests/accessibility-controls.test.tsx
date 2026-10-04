import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessibilityControls } from "@/components/accessibility-controls";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  PREFERENCE_BOOTSTRAP_SCRIPT,
  applyPreferencesToElement,
  readStoredPreferences,
  sanitizePreferences,
} from "@/lib/preferences";

const root = document.documentElement;
const DATA_KEYS = ["textScale", "contrast", "spacing", "typeface", "reduceMotion", "readingGuide", "highlightLinks"] as const;

function resetDom() {
  window.localStorage.clear();
  for (const key of DATA_KEYS) delete root.dataset[key];
}

describe("preference model", () => {
  it("rejects unknown or hostile stored values instead of trusting them", () => {
    expect(sanitizePreferences({ textScale: "<script>", contrast: "neon", reduceMotion: "yes" })).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences({ textScale: "largest", spacing: "loose" })).toMatchObject({ textScale: "largest", spacing: "loose" });
  });

  it("survives a corrupt storage value", () => {
    expect(readStoredPreferences(() => "{oops")).toEqual(DEFAULT_PREFERENCES);
    expect(readStoredPreferences(() => { throw new Error("blocked"); })).toEqual(DEFAULT_PREFERENCES);
  });

  it("writes only presentation attributes and nothing about activity data", () => {
    const target = document.createElement("html");
    applyPreferencesToElement(target, { ...DEFAULT_PREFERENCES, textScale: "largest", spacing: "loose", highlightLinks: true });

    expect(target.dataset.textScale).toBe("largest");
    expect(target.dataset.spacing).toBe("loose");
    expect(target.dataset.highlightLinks).toBe("true");
    expect(target.outerHTML).not.toMatch(/score|correctCount|session/i);
  });

  it("provides a pre-paint bootstrap that reads the same key and cannot throw", () => {
    expect(PREFERENCE_BOOTSTRAP_SCRIPT).toContain(PREFERENCES_STORAGE_KEY);
    expect(PREFERENCE_BOOTSTRAP_SCRIPT.trim().startsWith("(function")).toBe(true);
    expect(PREFERENCE_BOOTSTRAP_SCRIPT).toContain("catch");
    expect(() => Function("window", "document", "localStorage", PREFERENCE_BOOTSTRAP_SCRIPT)).not.toThrow();
  });
});

describe("AccessibilityControls panel", () => {
  beforeEach(resetDom);
  afterEach(resetDom);

  it("opens and closes accessibly, returning focus to the trigger", () => {
    render(<AccessibilityControls />);
    const trigger = screen.getByRole("button", { name: /reading options/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = screen.getByRole("region", { name: /reading options/i });
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(within(panel).getByText(/stay on this device and change how pages look/i)).toBeInTheDocument();
    expect(within(panel).getByText(/never change an activity/i)).toBeInTheDocument();
    expect(panel.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("region", { name: /reading options/i })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("applies a choice immediately, announces it, and stores only the preference", () => {
    render(<AccessibilityControls />);
    fireEvent.click(screen.getByRole("button", { name: /reading options/i }));
    fireEvent.click(screen.getByRole("button", { name: "Largest" }));

    expect(root.dataset.textScale).toBe("largest");
    expect(screen.getByRole("status")).toHaveTextContent(/text size: largest applied/i);
    expect(JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({ textScale: "largest" });
    expect(window.localStorage.length).toBe(1);
  });

  it("restores a saved setting on the next mount and resets it on request", () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ spacing: "loose", reduceMotion: true }));
    const { unmount } = render(<AccessibilityControls />);
    fireEvent.click(screen.getByRole("button", { name: /reading options/i }));

    expect(within(screen.getByRole("region", { name: /reading options/i })).getByRole("button", { name: "More space" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /reset defaults/i }));
    expect(root.dataset.spacing).toBe("normal");
    expect(root.dataset.reduceMotion).toBe("false");
    expect(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();

    unmount();
    render(<AccessibilityControls />);
    expect(root.dataset.spacing).toBe("normal");
  });

  it("keeps working when the browser refuses to store anything", () => {
    const failing = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("disabled");
    });

    render(<AccessibilityControls />);
    fireEvent.click(screen.getByRole("button", { name: /reading options/i }));
    fireEvent.click(screen.getByRole("button", { name: "Higher" }));

    expect(root.dataset.contrast).toBe("high");
    expect(screen.getByRole("region", { name: /reading options/i })).toBeInTheDocument();
    failing.mockRestore();
  });

  it("follows a change made in another tab", async () => {
    render(<AccessibilityControls />);
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ typeface: "serif" }));
    fireEvent(window, new Event("storage"));

    await waitFor(() => expect(root.dataset.typeface).toBe("serif"));
  });
});
