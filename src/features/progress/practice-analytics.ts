import { ACTIVITIES, GAME_IDS, type GameId, type TrainingSessionRecord } from "@/features/training/training-engine";
import { GOAL_PROGRAMS, type GoalId } from "@/features/goals/programs";
import { getProgramTimeline, isProgramProgress, type ProgramProgress } from "@/features/progress/program-progress";

/**
 * Read-only analysis of the practice records a user explicitly chose to save on this device.
 *
 * The output is deliberately descriptive: counts, ranges, and per-activity spread. There is no
 * combined score, no trend claim, and no "brain" metric anywhere in these types, because nothing
 * in the evidence base supports turning five-item sessions into a general ability measure.
 */

export type PracticeState = {
  goalId: GoalId | null;
  sessions: TrainingSessionRecord[];
  programProgress: ProgramProgress | null;
};

export type ActivitySummary = {
  activityId: GameId;
  name: string;
  domain: string;
  evidenceNote: string;
  sessions: number;
  items: number;
  correctItems: number;
  lowestFraction: number;
  highestFraction: number;
  medianFraction: number;
  /** Index = correct items in a session; value = how many sessions reached exactly that count. */
  distribution: number[];
  lastCompletedAt: string | null;
};

export type PracticeWeek = {
  weekKey: string;
  label: string;
  sessions: number;
  items: number;
};

export type PracticeSummary = {
  totalSessions: number;
  totalItems: number;
  correctItems: number;
  activities: ActivitySummary[];
  weeks: PracticeWeek[];
  practiceSessions: number;
  challengeSessions: number;
  firstCompletedAt: string | null;
  lastCompletedAt: string | null;
  goalName: string | null;
  goalWeekTarget: number | null;
  goalActivityCount: number | null;
  currentWeek: number | null;
  durationWeeks: number | null;
  programIsPaused: boolean;
  programIsComplete: boolean;
  sessionsThisWeekForGoal: number;
};

function isGoalId(value: unknown): value is GoalId {
  return typeof value === "string" && GOAL_PROGRAMS.some((program) => program.id === value);
}

function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && (GAME_IDS as readonly string[]).includes(value);
}

function isValidIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString() === value;
}

/** Tolerant by design: an unknown or corrupt record degrades to "nothing to show", never to a crash. */
export function parsePracticeState(raw: string | null | undefined): PracticeState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<{
      version: number;
      goalId: unknown;
      sessions: unknown;
      programProgress: unknown;
    }>;
    if (candidate.version !== 1 || !Array.isArray(candidate.sessions)) return null;

    const sessions = candidate.sessions.filter((session): session is TrainingSessionRecord => {
      if (!session || typeof session !== "object") return false;
      const value = session as Partial<TrainingSessionRecord>;
      return (
        typeof value.id === "string" &&
        isGameId(value.activityId) &&
        (value.mode === "practice" || value.mode === "challenge") &&
        Number.isInteger(value.correctCount ?? -1) &&
        Number.isInteger(value.totalCount ?? -1) &&
        (value.correctCount ?? -1) >= 0 &&
        (value.totalCount ?? 0) > 0 &&
        (value.correctCount ?? 0) <= (value.totalCount ?? 0) &&
        isValidIsoTimestamp(value.completedAt) &&
        (value.challengeCode === undefined || typeof value.challengeCode === "string")
      );
    });

    return {
      goalId: isGoalId(candidate.goalId) ? candidate.goalId : null,
      sessions,
      programProgress: isProgramProgress(candidate.programProgress) ? candidate.programProgress : null,
    };
  } catch {
    return null;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function utcWeekKey(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday));
  return monday.toISOString().slice(0, 10);
}

function weekLabel(weekKey: string): string {
  const date = new Date(`${weekKey}T00:00:00.000Z`);
  return date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function summarizePractice(state: PracticeState | null, now = new Date()): PracticeSummary | null {
  if (!state) return null;
  const sessions = [...state.sessions].sort((first, second) => Date.parse(first.completedAt) - Date.parse(second.completedAt));
  const program = GOAL_PROGRAMS.find((candidate) => candidate.id === state.goalId) ?? null;

  const activities: ActivitySummary[] = ACTIVITIES
    .map((activity) => {
      const own = sessions.filter((session) => session.activityId === activity.id);
      const fractions = own.map((session) => session.correctCount / session.totalCount);
      const items = own.reduce((total, session) => total + session.totalCount, 0);
      const correctItems = own.reduce((total, session) => total + session.correctCount, 0);
      const largestSet = own.reduce((largest, session) => Math.max(largest, session.totalCount), 0);
      const distribution = Array.from({ length: largestSet + 1 }, (_, correct) => own.filter((session) => session.correctCount === correct).length);

      return {
        activityId: activity.id,
        name: activity.name,
        domain: activity.domain,
        evidenceNote: activity.evidenceNote,
        sessions: own.length,
        items,
        correctItems,
        lowestFraction: fractions.length ? Math.min(...fractions) : 0,
        highestFraction: fractions.length ? Math.max(...fractions) : 0,
        medianFraction: median(fractions),
        distribution,
        lastCompletedAt: own.length ? own[own.length - 1].completedAt : null,
      };
    })
    .filter((summary) => summary.sessions > 0);

  const weeks = new Map<string, PracticeWeek>();
  for (const session of sessions) {
    const key = utcWeekKey(session.completedAt);
    const current = weeks.get(key) ?? { weekKey: key, label: weekLabel(key), sessions: 0, items: 0 };
    weeks.set(key, { ...current, sessions: current.sessions + 1, items: current.items + session.totalCount });
  }

  const timeline = getProgramTimeline(state.programProgress, program?.durationWeeks ?? 0, now);
  const currentWeekMonday = utcWeekKey(now.toISOString());
  const progress = state.programProgress;
  const goalSessionsThisWeek = program && progress
    ? sessions.filter((session) =>
        program.activityIds.includes(session.activityId) &&
        utcWeekKey(session.completedAt) === currentWeekMonday &&
        Date.parse(session.completedAt) >= Date.parse(progress.startedAt)).length
    : 0;

  return {
    totalSessions: sessions.length,
    totalItems: sessions.reduce((total, session) => total + session.totalCount, 0),
    correctItems: sessions.reduce((total, session) => total + session.correctCount, 0),
    activities,
    weeks: [...weeks.values()].sort((first, second) => first.weekKey.localeCompare(second.weekKey)),
    practiceSessions: sessions.filter((session) => session.mode === "practice").length,
    challengeSessions: sessions.filter((session) => session.mode === "challenge").length,
    firstCompletedAt: sessions.length ? sessions[0].completedAt : null,
    lastCompletedAt: sessions.length ? sessions[sessions.length - 1].completedAt : null,
    goalName: program?.name ?? null,
    goalWeekTarget: program?.weeklyTarget ?? null,
    goalActivityCount: program?.activityIds.length ?? null,
    currentWeek: timeline ? timeline.weekNumber : null,
    durationWeeks: program?.durationWeeks ?? null,
    programIsPaused: timeline?.isPaused ?? false,
    programIsComplete: timeline?.isComplete ?? false,
    sessionsThisWeekForGoal: goalSessionsThisWeek,
  };
}

export function formatFraction(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
