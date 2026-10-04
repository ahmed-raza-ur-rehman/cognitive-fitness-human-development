const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

export type ProgramProgress = {
  startedAt: string;
  pausedAt: string | null;
  pausedDurationMs: number;
};

export type ProgramTimeline = {
  weekNumber: number;
  weekIndex: number;
  elapsedActiveMs: number;
  completedWeeks: number;
  isPaused: boolean;
  isComplete: boolean;
};

function isValidTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

export function isProgramProgress(value: unknown): value is ProgramProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProgramProgress>;
  return (
    typeof candidate.startedAt === "string" &&
    isValidTimestamp(candidate.startedAt) &&
    (candidate.pausedAt === null || (typeof candidate.pausedAt === "string" && isValidTimestamp(candidate.pausedAt))) &&
    typeof candidate.pausedDurationMs === "number" &&
    Number.isSafeInteger(candidate.pausedDurationMs) &&
    candidate.pausedDurationMs >= 0
  );
}

export function startProgramProgress(now = new Date()): ProgramProgress {
  return { startedAt: now.toISOString(), pausedAt: null, pausedDurationMs: 0 };
}

export function pauseProgramProgress(progress: ProgramProgress, now = new Date()): ProgramProgress {
  if (progress.pausedAt) return progress;
  return { ...progress, pausedAt: now.toISOString() };
}

export function resumeProgramProgress(progress: ProgramProgress, now = new Date()): ProgramProgress {
  if (!progress.pausedAt) return progress;
  const pausedFor = Math.max(0, now.getTime() - Date.parse(progress.pausedAt));
  return {
    ...progress,
    pausedAt: null,
    pausedDurationMs: progress.pausedDurationMs + pausedFor,
  };
}

/** Computes active plan time; pause duration freezes the four-week schedule. */
export function getProgramTimeline(
  progress: ProgramProgress | null,
  durationWeeks: number,
  now = new Date(),
): ProgramTimeline | null {
  if (!progress || !isProgramProgress(progress) || !Number.isSafeInteger(durationWeeks) || durationWeeks < 1) {
    return null;
  }

  const currentlyPausedMs = progress.pausedAt
    ? Math.max(0, now.getTime() - Date.parse(progress.pausedAt))
    : 0;
  const elapsedActiveMs = Math.max(
    0,
    now.getTime() - Date.parse(progress.startedAt) - progress.pausedDurationMs - currentlyPausedMs,
  );
  const isComplete = elapsedActiveMs >= durationWeeks * WEEK_MS;
  const completedWeeks = Math.min(durationWeeks, Math.floor(elapsedActiveMs / WEEK_MS));
  const weekIndex = Math.min(durationWeeks - 1, completedWeeks);

  return {
    weekNumber: isComplete ? durationWeeks : weekIndex + 1,
    weekIndex,
    elapsedActiveMs,
    completedWeeks,
    isPaused: progress.pausedAt !== null,
    isComplete,
  };
}
