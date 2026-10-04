/**
 * Reading and display preferences, shared by the header control and the pre-paint bootstrap script.
 *
 * Preferences change presentation only. They never alter an activity's rules, its score, or what
 * its result can support, and they live in this browser alone.
 */

export type Preferences = {
  textScale: "normal" | "large" | "largest";
  contrast: "standard" | "high";
  spacing: "normal" | "loose";
  typeface: "default" | "serif";
  reduceMotion: boolean;
  readingGuide: boolean;
  highlightLinks: boolean;
};

export const PREFERENCES_STORAGE_KEY = "cognitive-fitness-accessibility-preferences";

export const DEFAULT_PREFERENCES: Preferences = {
  textScale: "normal",
  contrast: "standard",
  spacing: "normal",
  typeface: "default",
  reduceMotion: false,
  readingGuide: false,
  highlightLinks: false,
};

const TEXT_SCALES: Preferences["textScale"][] = ["normal", "large", "largest"];
const CONTRASTS: Preferences["contrast"][] = ["standard", "high"];
const SPACINGS: Preferences["spacing"][] = ["normal", "loose"];
const TYPEFACES: Preferences["typeface"][] = ["default", "serif"];

export function sanitizePreferences(value: unknown): Preferences {
  const candidate = (value && typeof value === "object" ? value : {}) as Partial<Preferences>;
  return {
    textScale: TEXT_SCALES.includes(candidate.textScale as Preferences["textScale"])
      ? candidate.textScale as Preferences["textScale"]
      : DEFAULT_PREFERENCES.textScale,
    contrast: CONTRASTS.includes(candidate.contrast as Preferences["contrast"])
      ? candidate.contrast as Preferences["contrast"]
      : DEFAULT_PREFERENCES.contrast,
    spacing: SPACINGS.includes(candidate.spacing as Preferences["spacing"])
      ? candidate.spacing as Preferences["spacing"]
      : DEFAULT_PREFERENCES.spacing,
    typeface: TYPEFACES.includes(candidate.typeface as Preferences["typeface"])
      ? candidate.typeface as Preferences["typeface"]
      : DEFAULT_PREFERENCES.typeface,
    reduceMotion: candidate.reduceMotion === true,
    readingGuide: candidate.readingGuide === true,
    highlightLinks: candidate.highlightLinks === true,
  };
}

export function readStoredPreferences(read: (key: string) => string | null): Preferences {
  try {
    const raw = read(PREFERENCES_STORAGE_KEY);
    return raw ? sanitizePreferences(JSON.parse(raw)) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyPreferencesToElement(element: HTMLElement, preferences: Preferences) {
  const next = sanitizePreferences(preferences);
  element.dataset.textScale = next.textScale;
  element.dataset.contrast = next.contrast;
  element.dataset.spacing = next.spacing;
  element.dataset.typeface = next.typeface;
  element.dataset.reduceMotion = next.reduceMotion ? "true" : "false";
  element.dataset.readingGuide = next.readingGuide ? "true" : "false";
  element.dataset.highlightLinks = next.highlightLinks ? "true" : "false";
}

/**
 * Runs before the first paint so a saved preference never flashes. It reads the same key the
 * panel writes, and a corrupt or unavailable value simply leaves defaults in place.
 */
export const PREFERENCE_BOOTSTRAP_SCRIPT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)});var p=raw?JSON.parse(raw):{};var r=document.documentElement;
var scales=["normal","large","largest"];var contrasts=["standard","high"];var spacings=["normal","loose"];var faces=["default","serif"];
r.setAttribute("data-text-scale",scales.indexOf(p.textScale)>-1?p.textScale:"normal");
r.setAttribute("data-contrast",contrasts.indexOf(p.contrast)>-1?p.contrast:"standard");
r.setAttribute("data-spacing",spacings.indexOf(p.spacing)>-1?p.spacing:"normal");
r.setAttribute("data-typeface",faces.indexOf(p.typeface)>-1?p.typeface:"default");
r.setAttribute("data-reduce-motion",p.reduceMotion===true?"true":"false");
r.setAttribute("data-reading-guide",p.readingGuide===true?"true":"false");
r.setAttribute("data-highlight-links",p.highlightLinks===true?"true":"false");}catch(e){}})();`;

export const PREFERENCE_LABELS = {
  textScale: { normal: "Comfortable", large: "Larger", largest: "Largest" },
  contrast: { standard: "Standard", high: "Higher contrast" },
  spacing: { normal: "Standard", loose: "More space" },
  typeface: { default: "This design", serif: "Serif" },
} as const;
