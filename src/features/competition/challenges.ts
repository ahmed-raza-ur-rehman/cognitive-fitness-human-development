import {
  ACTIVITIES,
  GAME_IDS,
  getPracticeQuestions,
  type DailyChallenge,
  type GameId,
  type TrainingQuestion,
} from "@/features/training/training-engine";

export const FRIEND_EVENT_VERSION = "CF3" as const;
export const FRIEND_EVENT_SETTINGS = Object.freeze({
  questionCount: 5,
  timed: false,
  scoring: "correct-count" as const,
});

export type WeeklyFriendChallenge = {
  version: typeof FRIEND_EVENT_VERSION;
  dateKey: string;
  gameId: GameId;
  gameVersion: string;
  code: string;
  seed: string;
  questions: TrainingQuestion[];
  settings: typeof FRIEND_EVENT_SETTINGS;
  window: {
    startAt: string;
    endAt: string;
    timezone: "UTC";
  };
  eligibility: {
    requiresCode: true;
    identityVerified: false;
    attemptLimit: null;
  };
};

export type CompetitionChallenge = DailyChallenge | WeeklyFriendChallenge;

export type SelfReportedChallengeResult = {
  eventCode: string;
  correctCount: number;
  totalCount: number;
};

function isValidDateKey(dateKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey;
}

function gameCode(gameId: GameId): string {
  return gameId.toUpperCase().replaceAll("-", "");
}

function dateCode(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

function dateFromCode(value: string): string | null {
  if (!/^\d{8}$/.test(value)) return null;
  const dateKey = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return isValidDateKey(dateKey) ? dateKey : null;
}

function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getUtcWeekStart(dateKey: string): string | null {
  if (!isValidDateKey(dateKey)) return null;
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

export function createWeeklyFriendChallenge(dateKey: string, gameId: GameId): WeeklyFriendChallenge {
  if (!isValidDateKey(dateKey) || getUtcWeekStart(dateKey) !== dateKey) {
    throw new Error("A weekly friend challenge must start on a valid Monday in UTC.");
  }
  if (!GAME_IDS.includes(gameId)) throw new Error("Choose a supported game for this challenge.");

  const activity = ACTIVITIES.find((candidate) => candidate.id === gameId);
  if (!activity) throw new Error("The selected game is not in the current catalog.");
  const versionCode = activity.version.replaceAll(".", "-");
  const code = `${FRIEND_EVENT_VERSION}-${dateCode(dateKey)}-${gameCode(gameId)}-V${versionCode}`;
  const questions = getPracticeQuestions(gameId, code);
  if (questions.length !== FRIEND_EVENT_SETTINGS.questionCount) {
    throw new Error("This challenge version requires exactly five questions.");
  }

  return {
    version: FRIEND_EVENT_VERSION,
    dateKey,
    gameId,
    gameVersion: activity.version,
    code,
    seed: code,
    questions,
    settings: FRIEND_EVENT_SETTINGS,
    window: {
      startAt: `${dateKey}T00:00:00.000Z`,
      endAt: `${addUtcDays(dateKey, 7)}T00:00:00.000Z`,
      timezone: "UTC",
    },
    eligibility: {
      requiresCode: true,
      identityVerified: false,
      attemptLimit: null,
    },
  };
}

export function parseWeeklyFriendChallengeCode(code: string): {
  dateKey: string;
  gameId: GameId;
  gameVersion: string;
} | null {
  const match = /^CF3-(\d{8})-([A-Z]+)-V(\d+)-(\d+)-(\d+)$/.exec(code.trim().toUpperCase());
  if (!match) return null;
  const dateKey = dateFromCode(match[1]);
  if (!dateKey || getUtcWeekStart(dateKey) !== dateKey) return null;

  const gameId = GAME_IDS.find((candidate) => gameCode(candidate) === match[2]);
  if (!gameId) return null;
  const activity = ACTIVITIES.find((candidate) => candidate.id === gameId);
  const gameVersion = `${match[3]}.${match[4]}.${match[5]}`;
  if (!activity || activity.version !== gameVersion) return null;

  return { dateKey, gameId, gameVersion };
}

export function getWeeklyFriendChallengeFromCode(code: string): WeeklyFriendChallenge | null {
  const parsed = parseWeeklyFriendChallengeCode(code);
  if (!parsed) return null;
  const event = createWeeklyFriendChallenge(parsed.dateKey, parsed.gameId);
  return event.code === code.trim().toUpperCase() ? event : null;
}

export type FriendChallengeWindowState = "upcoming" | "open" | "closed";

export function getFriendChallengeWindowState(
  challenge: WeeklyFriendChallenge,
  currentUtcDate: string,
): FriendChallengeWindowState | null {
  if (!isValidDateKey(currentUtcDate)) return null;
  if (currentUtcDate < challenge.dateKey) return "upcoming";
  if (currentUtcDate >= addUtcDays(challenge.dateKey, 7)) return "closed";
  return "open";
}

export function createSelfReportedResultCode(
  eventCode: string,
  correctCount: number,
  totalCount: number,
): string | null {
  const hasChallengePrefix = /^(?:CF1|CF2|CF3)-[A-Z0-9.-]+$/.test(eventCode);
  if (
    !hasChallengePrefix ||
    !Number.isSafeInteger(correctCount) ||
    !Number.isSafeInteger(totalCount) ||
    totalCount < 1 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) return null;
  return `CR1|${eventCode}|${correctCount}/${totalCount}`;
}

export function parseSelfReportedResultCode(
  value: string,
  expectedEventCode: string,
  expectedTotalCount: number,
): SelfReportedChallengeResult | null {
  const match = /^CR1\|([^|]+)\|(\d+)\/(\d+)$/.exec(value.trim());
  if (!match || match[1] !== expectedEventCode || !Number.isSafeInteger(expectedTotalCount) || expectedTotalCount < 1) {
    return null;
  }
  const correctCount = Number(match[2]);
  const totalCount = Number(match[3]);
  if (
    !Number.isSafeInteger(correctCount) ||
    !Number.isSafeInteger(totalCount) ||
    totalCount !== expectedTotalCount ||
    correctCount < 0 ||
    correctCount > totalCount
  ) return null;
  return { eventCode: match[1], correctCount, totalCount };
}
