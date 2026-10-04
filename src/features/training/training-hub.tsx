"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { GameSession } from "@/features/games/core/contracts";
import { createGameSession, reduceGameSession } from "@/features/games/core/session";
import {
  createSelfReportedResultCode,
  createWeeklyFriendChallenge,
  getFriendChallengeWindowState,
  getUtcWeekStart,
  getWeeklyFriendChallengeFromCode,
  parseSelfReportedResultCode,
  type CompetitionChallenge,
  type SelfReportedChallengeResult,
  type WeeklyFriendChallenge,
} from "@/features/competition/challenges";
import {
  getProgramTimeline,
  isProgramProgress,
  pauseProgramProgress,
  resumeProgramProgress,
  startProgramProgress,
  type ProgramProgress,
} from "@/features/progress/program-progress";
import {
  ACTIVITIES,
  CHALLENGE_VERSION,
  GAME_IDS,
  GOAL_PROGRAMS,
  TRAINING_ENGINE_VERSION,
  TRAINING_STORAGE_KEY,
  getChallengeFromCode,
  getDailyChallenge,
  getNextProgramActivity,
  getProgram,
  getPracticeQuestions,
  getWeeklySessionCount,
  isStudyQuestion,
  scoreAnswers,
  type GameId,
  type GoalId,
  type TrainingQuestion,
  type TrainingSessionRecord,
} from "@/features/training/training-engine";

type SavedTrainingState = {
  version: 1;
  goalId: GoalId | null;
  sessions: TrainingSessionRecord[];
  programProgress: ProgramProgress | null;
};

type RunState = GameSession<TrainingQuestion, GameId>;

type CompletedResult = {
  activityId: GameId;
  mode: "practice" | "challenge";
  correctCount: number;
  totalCount: number;
  challengeCode?: string;
};

const MAX_STORED_SESSIONS = 200;

function isGameId(value: unknown): value is GameId {
  return typeof value === "string" && GAME_IDS.includes(value as GameId);
}

function isGoalId(value: unknown): value is GoalId {
  return typeof value === "string" && GOAL_PROGRAMS.some((program) => program.id === value);
}

function parseSavedState(raw: string | null): SavedTrainingState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<SavedTrainingState>;
    if (candidate.version !== 1 || !Array.isArray(candidate.sessions)) return null;

    const sessions = candidate.sessions.filter((session): session is TrainingSessionRecord => {
      if (!session || typeof session !== "object") return false;
      return (
        typeof session.id === "string" &&
        isGameId(session.activityId) &&
        (session.mode === "practice" || session.mode === "challenge") &&
        Number.isInteger(session.correctCount) &&
        Number.isInteger(session.totalCount) &&
        session.correctCount >= 0 &&
        session.totalCount > 0 &&
        session.correctCount <= session.totalCount &&
        typeof session.completedAt === "string" &&
        !Number.isNaN(Date.parse(session.completedAt)) &&
        (session.challengeCode === undefined || typeof session.challengeCode === "string")
      );
    });

    return {
      version: 1,
      goalId: isGoalId(candidate.goalId) ? candidate.goalId : null,
      sessions: sessions.slice(0, MAX_STORED_SESSIONS),
      programProgress: isProgramProgress(candidate.programProgress) ? candidate.programProgress : null,
    };
  } catch {
    return null;
  }
}

const TRAINING_STORE_EVENT = "cognitive-fitness-training-store";

function subscribeToTrainingStore(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(TRAINING_STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TRAINING_STORE_EVENT, onChange);
  };
}

function getTrainingSnapshot(): string | null {
  try {
    return window.localStorage.getItem(TRAINING_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getTrainingServerSnapshot(): string | null {
  return null;
}

function writeTrainingState(state: SavedTrainingState) {
  window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(TRAINING_STORE_EVENT));
}

function removeTrainingState() {
  window.localStorage.removeItem(TRAINING_STORAGE_KEY);
  window.dispatchEvent(new Event(TRAINING_STORE_EVENT));
}

function subscribeToUTCDate(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getUTCDateSnapshot(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUTCDateServerSnapshot(): null {
  return null;
}

function subscribeToLocation(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getLocationSnapshot(): string {
  return window.location.search;
}

function getLocationServerSnapshot(): string {
  return "";
}

function formatDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function gameName(gameId: GameId): string {
  return ACTIVITIES.find((activity) => activity.id === gameId)?.name ?? "Training activity";
}

function getCompetitionChallengeFromCode(code: string): CompetitionChallenge | null {
  return getWeeklyFriendChallengeFromCode(code) ?? getChallengeFromCode(code);
}

function isWeeklyFriendChallenge(challenge: CompetitionChallenge): challenge is WeeklyFriendChallenge {
  return challenge.version === "CF3";
}

function formatChallengeWindow(challenge: CompetitionChallenge): string {
  if (!isWeeklyFriendChallenge(challenge)) return `${formatDate(challenge.dateKey)} · UTC`;
  const lastDay = new Date(Date.parse(challenge.window.endAt) - 86_400_000).toISOString().slice(0, 10);
  return `${formatDate(challenge.dateKey)} through ${formatDate(lastDay)} · UTC`;
}

function formatSessionDate(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}

export function TrainingHub() {
  const storedSnapshot = useSyncExternalStore(
    subscribeToTrainingStore,
    getTrainingSnapshot,
    getTrainingServerSnapshot,
  );
  const utcDate = useSyncExternalStore(
    subscribeToUTCDate,
    getUTCDateSnapshot,
    getUTCDateServerSnapshot,
  );
  const search = useSyncExternalStore(
    subscribeToLocation,
    getLocationSnapshot,
    getLocationServerSnapshot,
  );
  const savedState = parseSavedState(storedSnapshot);
  const [draftState, setDraftState] = useState<SavedTrainingState>({ version: 1, goalId: null, sessions: [], programProgress: null });
  const [fallbackState, setFallbackState] = useState<SavedTrainingState | null>(null);
  const savedOnDevice = savedState !== null && fallbackState === null;
  const hasStoredSave = savedState !== null;
  const canManageProgress = hasStoredSave || fallbackState !== null;
  const canExportProgress = fallbackState === null
    ? hasStoredSave
    : fallbackState.goalId !== null || fallbackState.sessions.length > 0;
  const [storageMessage, setStorageMessage] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<CompetitionChallenge | null>(null);
  const [challengeCodeInput, setChallengeCodeInput] = useState("");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [friendChallengeGameChoice, setFriendChallengeGameChoice] = useState<GameId | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [result, setResult] = useState<CompletedResult | null>(null);
  const [shareFeedback, setShareFeedback] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const gameHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousRunPosition = useRef("");

  useEffect(() => {
    if (run) {
      const position = `${run.questionIndex}-${run.phase}`;
      if (previousRunPosition.current !== position) {
        gameHeadingRef.current?.focus();
        previousRunPosition.current = position;
      }
    } else {
      previousRunPosition.current = "";
    }
  }, [run]);

  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  const data = fallbackState ?? savedState ?? draftState;
  const goalId = data.goalId;
  const sessions = data.sessions;
  const todayChallenge = utcDate ? getDailyChallenge(utcDate) : null;
  const initialCode = new URLSearchParams(search).get("challenge");
  const importedChallenge = initialCode ? getCompetitionChallengeFromCode(initialCode) : null;
  const activeChallenge = selectedChallenge ?? importedChallenge ?? todayChallenge;
  const selectedProgram = getProgram(goalId);
  const programTimeline = selectedProgram
    ? getProgramTimeline(data.programProgress, selectedProgram.durationWeeks, new Date())
    : null;
  const currentProgramWeek = selectedProgram && programTimeline
    ? selectedProgram.weeks[programTimeline.weekIndex]
    : null;
  const weeklyCount = getWeeklySessionCount(
    sessions,
    new Date(),
    selectedProgram?.activityIds,
    data.programProgress?.startedAt,
  );
  const dailyChallengeSupportsGoal = Boolean(
    selectedProgram && todayChallenge && selectedProgram.activityIds.includes(todayChallenge.gameId),
  );
  const nextActivity = selectedProgram && programTimeline && !programTimeline.isPaused && !programTimeline.isComplete
    ? getNextProgramActivity(selectedProgram, weeklyCount, programTimeline.weekIndex)
    : null;
  const friendChallengeCandidates: readonly GameId[] = selectedProgram?.activityIds ?? GAME_IDS;
  const suggestedFriendGame = selectedProgram
    ? nextActivity?.id ?? currentProgramWeek?.activityIds[0] ?? selectedProgram.activityIds[0]
    : todayChallenge?.gameId ?? GAME_IDS[0];
  const friendChallengeGameId = friendChallengeCandidates.includes(friendChallengeGameChoice ?? suggestedFriendGame)
    ? friendChallengeGameChoice ?? suggestedFriendGame
    : friendChallengeCandidates[0];
  const activeChallengeWindowState = activeChallenge && isWeeklyFriendChallenge(activeChallenge) && utcDate
    ? getFriendChallengeWindowState(activeChallenge, utcDate)
    : null;
  const activeChallengeCanStart = activeChallenge
    ? !isWeeklyFriendChallenge(activeChallenge) || activeChallengeWindowState === "open"
    : false;
  const sharedResultCode = new URLSearchParams(search).get("result");
  const parsedSharedResult = importedChallenge && sharedResultCode
    ? parseSelfReportedResultCode(sharedResultCode, importedChallenge.code, importedChallenge.questions.length)
    : null;
  const peerResult: SelfReportedChallengeResult | null = activeChallenge?.code === importedChallenge?.code
    ? parsedSharedResult
    : null;
  const currentQuestion = run?.questions[run.questionIndex] ?? null;
  const selectedAnswer = run ? run.answers[run.questionIndex] : null;
  const importedChallengeMessage = importedChallenge
    ? activeChallengeWindowState === "closed"
      ? `This event week (${formatChallengeWindow(importedChallenge)}) has ended; a new attempt is no longer available.`
      : activeChallengeWindowState === "upcoming"
        ? `This event week starts later: ${formatChallengeWindow(importedChallenge)}.`
        : `Challenge loaded: ${formatChallengeWindow(importedChallenge)} · ${gameName(importedChallenge.gameId)}.`
    : "That challenge code is not valid for this version. Ask your friend to share the current challenge link.";
  const effectiveChallengeMessage = challengeMessage || (
    initialCode && (!importedChallenge || activeChallenge?.code === importedChallenge.code)
      ? importedChallengeMessage
      : ""
  );

  function persist(nextState: SavedTrainingState) {
    if (!savedOnDevice) {
      if (fallbackState !== null) setFallbackState(nextState);
      else setDraftState(nextState);
      return;
    }
    try {
      writeTrainingState({ ...nextState, sessions: nextState.sessions.slice(0, MAX_STORED_SESSIONS) });
      setStorageMessage("Saved on this device only. You can clear it at any time.");
    } catch {
      setStorageMessage("This browser could not save your data. Your current progress will continue in this page session only.");
      setFallbackState(nextState);
    }
  }

  function chooseGoal(nextGoalId: GoalId) {
    persist({ ...data, goalId: nextGoalId, programProgress: startProgramProgress() });
  }

  function startProgram() {
    if (!goalId) return;
    persist({ ...data, programProgress: startProgramProgress() });
  }

  function toggleProgramPause() {
    if (!data.programProgress) return;
    const updated = data.programProgress.pausedAt
      ? resumeProgramProgress(data.programProgress)
      : pauseProgramProgress(data.programProgress);
    persist({ ...data, programProgress: updated });
  }

  function stopProgram() {
    persist({ ...data, programProgress: null });
  }

  function enableLocalSave() {
    if (!goalId) {
      setStorageMessage("Choose a practice goal before saving progress.");
      return;
    }
    try {
      writeTrainingState({ ...data, sessions: data.sessions.slice(0, MAX_STORED_SESSIONS) });
      setFallbackState(null);
      setStorageMessage("Saved on this device only. No account or remote profile was created.");
    } catch {
      setStorageMessage("This browser could not save your data. You can still use the activities without persistence.");
    }
  }

  function exportLocalSave() {
    if (!canExportProgress) return;
    try {
      const exportValue = {
        exportedAt: new Date().toISOString(),
        version: data.version,
        goalId: data.goalId,
        sessions: data.sessions,
        programProgress: data.programProgress,
      };
      const blob = new Blob([JSON.stringify(exportValue, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cognitive-fitness-progress-${getUTCDateSnapshot()}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setStorageMessage("A JSON export of the current goal, schedule, and recent task scores was created on this device.");
    } catch {
      setStorageMessage("The browser could not export this data. You can still review it here or clear it.");
    }
  }

  function clearLocalSave() {
    try {
      removeTrainingState();
      setFallbackState(null);
      setDraftState({ version: 1, goalId: null, sessions: [], programProgress: null });
      setStorageMessage("Saved goal and session history cleared from this device.");
    } catch {
      const emptyState: SavedTrainingState = { version: 1, goalId: null, sessions: [], programProgress: null };
      setFallbackState(emptyState);
      setDraftState(emptyState);
      setStorageMessage("The page history was cleared, but the browser could not confirm deletion of its saved copy. Use your browser's site-data settings to remove that copy.");
    }
  }

  function startRun(activityId: GameId, mode: "practice" | "challenge", challenge?: CompetitionChallenge) {
    const seed = challenge?.code ?? `practice:${activityId}:${Date.now()}`;
    const questions = challenge?.questions ?? getPracticeQuestions(activityId, seed);
    const activity = ACTIVITIES.find((item) => item.id === activityId);
    const session = createGameSession({
      sessionId: `${activityId}:${Date.now()}:${seed}`,
      gameId: activityId,
      gameVersion: activity?.version ?? TRAINING_ENGINE_VERSION,
      mode,
      seed,
      challengeCode: challenge?.code,
      questions,
      initialPhase: isStudyQuestion(questions[0]) ? "study" : "answer",
    });
    setResult(null);
    setShareFeedback("");
    setShareFallback("");
    setRun(session);
  }

  function answerQuestion(optionIndex: number) {
    setRun((previous) => previous
      ? reduceGameSession(previous, { type: "submit-answer", optionIndex })
      : previous);
  }

  function completeRun(completedRun: RunState) {
    const correctCount = scoreAnswers(completedRun.questions, completedRun.answers);
    const completedAt = new Date().toISOString();
    const newResult: CompletedResult = {
      activityId: completedRun.gameId,
      mode: completedRun.mode,
      correctCount,
      totalCount: completedRun.questions.length,
      challengeCode: completedRun.challengeCode,
    };
    const record: TrainingSessionRecord = {
      id: `${completedAt}-${completedRun.gameId}`,
      activityId: completedRun.gameId,
      mode: completedRun.mode,
      correctCount,
      totalCount: completedRun.questions.length,
      completedAt,
      ...(completedRun.challengeCode ? { challengeCode: completedRun.challengeCode } : {}),
    };
    const nextSessions = [record, ...sessions].slice(0, MAX_STORED_SESSIONS);

    setResult(newResult);
    setRun(null);
    persist({ version: 1, goalId, sessions: nextSessions, programProgress: data.programProgress });
  }

  function continueRun() {
    if (!run) return;
    const nextQuestion = run.questions[run.questionIndex + 1];
    const advanced = reduceGameSession(run, {
      type: "continue",
      nextPhase: isStudyQuestion(nextQuestion) ? "study" : "answer",
    });
    if (advanced.phase === "completed") {
      completeRun(advanced);
      return;
    }
    setRun(advanced);
  }

  function leaveRun() {
    setRun((previous) => previous ? reduceGameSession(previous, { type: "leave" }) : previous);
  }

  function loadChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const challenge = getCompetitionChallengeFromCode(challengeCodeInput);
    if (!challenge) {
      setChallengeMessage("We could not match that code to a valid, versioned challenge. Check the code and try again.");
      return;
    }
    setSelectedChallenge(challenge);
    setChallengeCodeInput(challenge.code);
    const windowState = isWeeklyFriendChallenge(challenge) && utcDate
      ? getFriendChallengeWindowState(challenge, utcDate)
      : "open";
    setChallengeMessage(windowState === "closed"
      ? `This event week (${formatChallengeWindow(challenge)}) has ended; a new attempt is no longer available.`
      : windowState === "upcoming"
        ? `This event week starts later: ${formatChallengeWindow(challenge)}.`
        : `Challenge loaded: ${formatChallengeWindow(challenge)} · ${gameName(challenge.gameId)}.`);
  }

  function createFriendChallenge() {
    if (!utcDate) return;
    const weekStart = getUtcWeekStart(utcDate);
    if (!weekStart) return;
    const challenge = createWeeklyFriendChallenge(weekStart, friendChallengeGameId);
    setSelectedChallenge(challenge);
    setChallengeCodeInput(challenge.code);
    setChallengeMessage(`Created a fixed CF3 event for ${gameName(challenge.gameId)}. It is open this UTC week; anyone with the code may retry, and scores are self-reported.`);
    setShareFeedback("");
    setShareFallback("");
  }

  async function copyChallenge(text: string) {
    setShareFallback("");
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback("Copied. Send this to a friend if you want to compare the same game.");
    } catch {
      setShareFeedback("Clipboard access is unavailable here. The share text is ready to copy manually.");
      setShareFallback(text);
    }
  }

  function challengeInvite(challenge: CompetitionChallenge, resultCode?: string) {
    const params = new URLSearchParams({ challenge: challenge.code });
    if (resultCode) params.set("result", resultCode);
    const link = `${window.location.origin}/train?${params.toString()}`;
    const eventRules = isWeeklyFriendChallenge(challenge)
      ? `Game version ${challenge.gameVersion}; ${challenge.settings.questionCount} questions; no timer; correct answers only; event week ${formatChallengeWindow(challenge)}. New attempts may start during that client-checked week; a started set may finish later. Anyone with the code may retry; identity, clock, and attempt limits are not server-enforced.`
      : `Same versioned questions for ${formatChallengeWindow(challenge)}; untimed; accuracy only.`;
    return `Cognitive Fitness Lab friend challenge\nChallenge code: ${challenge.code}\nGame: ${gameName(challenge.gameId)}\nRules: ${eventRules} Results are self-reported and unverified; retries are possible. Compare only this event.\n${resultCode ? `Self-reported result code: ${resultCode}\n` : ""}Play: ${link}`;
  }

  function shareResult(completedResult: CompletedResult) {
    if (!completedResult.challengeCode) return;
    const challenge = getCompetitionChallengeFromCode(completedResult.challengeCode);
    if (!challenge) return;
    const resultCode = createSelfReportedResultCode(
      challenge.code,
      completedResult.correctCount,
      completedResult.totalCount,
    );
    if (!resultCode) return;
    const invite = challengeInvite(challenge, resultCode);
    const summary = `\nShared report: ${completedResult.correctCount}/${completedResult.totalCount} correct. The recipient may play the same set and compare; no result is verified and no identity is included.`;
    void copyChallenge(`${invite}${summary}`);
  }

  function startTodayChallenge() {
    if (!todayChallenge) return;
    setSelectedChallenge(todayChallenge);
    startRun(todayChallenge.gameId, "challenge", todayChallenge);
  }

  function startSelectedChallenge() {
    if (!activeChallenge || !activeChallengeCanStart) return;
    startRun(activeChallenge.gameId, "challenge", activeChallenge);
  }

  return (
    <main id="main-content" className="training-page container">
      <header className="training-hero">
        <div className="training-hero-copy">
          <p className="section-kicker">TRAIN / PRACTICE, GOALS, AND FRIEND CHALLENGES</p>
          <h1>Make practice fit the life you want to build.</h1>
          <p>
            Choose a practical goal, play short skill-specific activities, and—if you want—share an optional daily or weekly friend challenge. Progress here means practice completed, not a score for your mind or health.
          </p>
          <ul className="training-principles" aria-label="Training principles">
            <li>No account required</li>
            <li>Untimed activities</li>
            <li>Local progress is optional</li>
          </ul>
        </div>
        <aside className="daily-challenge-card" aria-labelledby="daily-challenge-title">
          <div className="training-card-topline">
            <span className="mini-label">OPTIONAL DAILY CHALLENGE</span>
            <span className="training-version">{CHALLENGE_VERSION} · FIXED RULES</span>
          </div>
          <h2 id="daily-challenge-title">One game. Same seed. Your choice.</h2>
          {todayChallenge ? (
            <>
              <p className="daily-challenge-date">{formatDate(todayChallenge.dateKey)} · UTC</p>
              <p className="daily-game-name">{gameName(todayChallenge.gameId)}</p>
              <p className="daily-challenge-copy">
                The questions and answer order are fixed for this UTC date. The five-question set is untimed; compare accuracy only. No public ranking or server verification yet.
              </p>
              {selectedProgram ? (
                <p className="field-hint">
                  {dailyChallengeSupportsGoal
                    ? `This activity is part of ${selectedProgram.name}; finishing it can count as one routine session this week.`
                    : `This activity is outside ${selectedProgram.name}; it stays optional and will not count toward that goal target.`}
                </p>
              ) : null}
              <button className="button button-primary" onClick={startTodayChallenge} type="button" disabled={Boolean(run)}>
                Play today’s challenge
              </button>
              <button className="text-button" onClick={() => void copyChallenge(challengeInvite(todayChallenge))} type="button">
                Copy today’s daily challenge invite
              </button>
              {shareFeedback && !result ? <p className="field-hint" role="status">{shareFeedback}</p> : null}
              {shareFallback && !result ? (
                <label className="share-fallback-label" htmlFor="invite-share-fallback">
                  Share text (select and copy)
                  <textarea id="invite-share-fallback" rows={5} readOnly value={shareFallback} />
                </label>
              ) : null}
            </>
          ) : <p className="field-hint">Preparing today’s fixed challenge…</p>}
          <details className="challenge-code-details">
            <summary>Create a weekly friend challenge</summary>
            <p className="field-hint">
              {selectedProgram
                ? `Choose only a game from ${selectedProgram.name}. If the completed game matches this goal, the session can count toward its weekly target.`
                : "Choose any catalog game. If you later select a goal, the session counts only if that game belongs to the goal."}
              {" "}The same code gives both people the same five-item set; no account is needed.
            </p>
            <label htmlFor="friend-challenge-game">Game for this event</label>
            <select
              id="friend-challenge-game"
              value={friendChallengeGameId}
              onChange={(event) => setFriendChallengeGameChoice(event.target.value as GameId)}
              disabled={Boolean(run)}
            >
              {friendChallengeCandidates.map((gameId) => <option key={gameId} value={gameId}>{gameName(gameId)}</option>)}
            </select>
            <p className="field-hint">CF3 binds the game version, seed, scoring, and Monday–Sunday UTC week. Anyone with the code may retry; date, identity, and attempt limits are not server-enforced. Results stay self-reported and unverified.</p>
            <button className="button button-quiet" onClick={createFriendChallenge} type="button" disabled={!utcDate || Boolean(run)}>
              Create this week’s friend challenge
            </button>
          </details>
          {activeChallenge && isWeeklyFriendChallenge(activeChallenge) ? (
            <section className="competition-event-card" aria-label="Weekly friend challenge details">
              <p className="mini-label">WEEKLY FRIEND EVENT · {activeChallenge.version}</p>
              <h3>{gameName(activeChallenge.gameId)}</h3>
              <p><strong>Event code:</strong> <code>{activeChallenge.code}</code></p>
              <p><strong>Game rules version:</strong> {activeChallenge.gameVersion} · five questions · untimed · correct-count only.</p>
              <p><strong>Event window:</strong> {formatChallengeWindow(activeChallenge)}. The browser blocks new starts outside this UTC week; an already-started set may finish after it. The clock, identity, and attempt limits are not server-enforced.</p>
              {selectedProgram && !selectedProgram.activityIds.includes(activeChallenge.gameId) ? (
                <p className="field-hint">This friend event is outside {selectedProgram.name}. You may play it as an optional challenge, but it will not count toward this goal’s weekly target.</p>
              ) : null}
              {activeChallengeWindowState === "open" ? (
                <p className="field-hint">This event is open. Replays are allowed; scores are not verified.</p>
              ) : activeChallengeWindowState === "closed" ? (
                <p className="field-hint" role="status">This event week has ended. You can inspect its code, but cannot start a new attempt.</p>
              ) : activeChallengeWindowState === "upcoming" ? (
                <p className="field-hint" role="status">This event week has not started yet.</p>
              ) : <p className="field-hint">Checking the UTC event window…</p>}
              {peerResult ? (
                <p className="field-hint" role="status">An unverified self-reported result of {peerResult.correctCount}/{peerResult.totalCount} is attached to this exact event. Play the same set to compare; the code does not identify who supplied it.</p>
              ) : sharedResultCode ? (
                <p className="field-hint" role="status">The attached result code is invalid or belongs to another event, so no comparison was loaded.</p>
              ) : null}
              <button className="button button-primary" onClick={startSelectedChallenge} type="button" disabled={Boolean(run) || !activeChallengeCanStart}>
                Play this weekly set
              </button>
              <button className="text-button" onClick={() => void copyChallenge(challengeInvite(activeChallenge))} type="button">
                Copy weekly friend invite
              </button>
            </section>
          ) : null}
          <details className="challenge-code-details">
            <summary>Have a friend’s challenge code?</summary>
            <form className="challenge-code-form" onSubmit={loadChallenge}>
              <label htmlFor="challenge-code">Challenge code</label>
              <input
                id="challenge-code"
                autoComplete="off"
                disabled={Boolean(run)}
                maxLength={64}
                onChange={(event) => setChallengeCodeInput(event.target.value)}
                placeholder="CF3-20261005-LOGIC-V1-0-0"
                value={challengeCodeInput || importedChallenge?.code || initialCode || ""}
              />
              <button className="button button-quiet" type="submit" disabled={Boolean(run)}>Load challenge</button>
            </form>
            {effectiveChallengeMessage ? <p className="field-hint" role="status">{effectiveChallengeMessage}</p> : null}
            {peerResult && !result && importedChallenge && !isWeeklyFriendChallenge(importedChallenge) ? (
              <p className="field-hint" role="status">An unverified self-reported {peerResult.correctCount}/{peerResult.totalCount} result is attached to this exact event. Play it to compare; the code does not identify who supplied it.</p>
            ) : null}
            {sharedResultCode && importedChallenge && !peerResult && activeChallenge?.code === importedChallenge.code ? (
              <p className="field-hint" role="status">The attached result code is invalid or does not match this challenge; no comparison was loaded.</p>
            ) : null}
            {activeChallenge && todayChallenge?.code !== activeChallenge.code ? (
              <>
                <button className="button button-outline" onClick={startSelectedChallenge} type="button" disabled={Boolean(run) || !activeChallengeCanStart}>
                  Play loaded challenge · {formatChallengeWindow(activeChallenge)}
                </button>
                <button className="text-button" onClick={() => void copyChallenge(challengeInvite(activeChallenge))} type="button">
                  Copy invite for loaded challenge
                </button>
              </>
            ) : null}
          </details>
        </aside>
      </header>

      {run ? (
        <section className="active-training-card" id="active-training" aria-labelledby="active-training-title">
          <div className="training-card-topline">
            <span className="mini-label">{run.mode === "challenge" ? "FRIEND CHALLENGE" : "PRACTICE SESSION"}</span>
            <span className="question-counter" aria-live="polite" aria-atomic="true">Question {run.questionIndex + 1} of {run.questions.length}</span>
          </div>
          <h2 id="active-training-title">{gameName(run.gameId)}</h2>
          {run.challengeCode ? <p className="field-hint">Fixed challenge: {run.challengeCode} · Untimed · Accuracy only</p> : null}
          {run.phase !== "abandoned" && currentQuestion ? (
            <div className="training-question" key={currentQuestion.id}>
              {run.phase === "study" && currentQuestion.studyItems ? (
                <div className="study-phase">
                  <h3 ref={gameHeadingRef} tabIndex={-1}>Study this sequence for as long as you need.</h3>
                  <p className="field-hint">Nothing disappears automatically. Choose when you are ready to hide it.</p>
                  <ol className="study-sequence" aria-label="Number sequence to remember">
                    {currentQuestion.studyItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                  </ol>
                  <button className="button button-primary" onClick={() => setRun((previous) => previous
                    ? reduceGameSession(previous, { type: "hide-stimulus" })
                    : previous)} type="button">
                    Hide sequence and answer
                  </button>
                </div>
              ) : null}
              {run.phase === "study" && currentQuestion.studyMatrix ? (
                <div className="study-phase">
                  <h3 ref={gameHeadingRef} tabIndex={-1}>Study this cell pattern for as long as you need.</h3>
                  <p className="field-hint">Filled cells are marked; empty cells are open. Nothing disappears automatically.</p>
                  <table className="memory-matrix-grid">
                    <caption>Study grid. Rows and columns are numbered. Filled cells will be hidden when you choose.</caption>
                    <thead>
                      <tr><th scope="col">Row</th>{currentQuestion.studyMatrix[0]?.map((_, index) => <th scope="col" key={`column-${index}`}>Column {index + 1}</th>)}</tr>
                    </thead>
                    <tbody>
                      {currentQuestion.studyMatrix.map((row, rowIndex) => (
                        <tr key={`memory-row-${rowIndex}`}>
                          <th scope="row">Row {rowIndex + 1}</th>
                          {row.map((filled, columnIndex) => (
                            <td key={`memory-${rowIndex}-${columnIndex}`} aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}, ${filled ? "filled" : "empty"}`}>
                              <span aria-hidden="true">{filled ? "■" : "□"}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="button button-primary" onClick={() => setRun((previous) => previous
                    ? reduceGameSession(previous, { type: "hide-stimulus" })
                    : previous)} type="button">
                    Hide pattern and answer
                  </button>
                </div>
              ) : null}
              {run.phase !== "study" ? (
                <>
                  {currentQuestion.planningGrid ? (
                    <div className="letter-matrix-wrap">
                      <h3 className="matrix-instructions" ref={run.phase === "answer" ? gameHeadingRef : undefined} tabIndex={run.phase === "answer" ? -1 : undefined}>
                        {currentQuestion.prompt}
                      </h3>
                      <table className="route-planning-grid">
                        <caption>Route map. S is Start, G is Goal, X is blocked, and a dot is open.</caption>
                        <tbody>
                          {currentQuestion.planningGrid.map((row, rowIndex) => (
                            <tr key={`${currentQuestion.id}-route-row-${rowIndex}`}>
                              {row.map((cell, columnIndex) => {
                                const label = cell === "S" ? "Start" : cell === "G" ? "Goal" : cell === "#" ? "Blocked" : "Open";
                                return <td key={`${currentQuestion.id}-route-${rowIndex}-${columnIndex}`} aria-label={`${label}, row ${rowIndex + 1}, column ${columnIndex + 1}`}>{cell === "#" ? "X" : cell === "." ? "·" : cell}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : currentQuestion.matrix ? (
                    <div className="letter-matrix-wrap">
                      <h3 className="matrix-instructions" ref={run.phase === "answer" ? gameHeadingRef : undefined} tabIndex={run.phase === "answer" ? -1 : undefined}>
                        {currentQuestion.prompt} Target: {currentQuestion.targetSymbol}.
                      </h3>
                      <table className="letter-matrix">
                        <caption className="visually-hidden">A letter grid. Count each {currentQuestion.targetSymbol} symbol.</caption>
                        <tbody>
                          {currentQuestion.matrix.map((row, rowIndex) => (
                            <tr key={`${currentQuestion.id}-row-${rowIndex}`}>
                              {row.map((symbol, columnIndex) => <td key={`${currentQuestion.id}-${rowIndex}-${columnIndex}`}>{symbol}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <h3 className="training-prompt" ref={run.phase === "answer" ? gameHeadingRef : undefined} tabIndex={run.phase === "answer" ? -1 : undefined}>
                      {currentQuestion.prompt}
                    </h3>
                  )}
                  {run.phase === "answer" ? (
                    <div className="answer-options" role="group" aria-label="Answer choices">
                      {currentQuestion.options.map((option, index) => (
                        <button className="answer-option" key={`${currentQuestion.id}-${option}`} onClick={() => answerQuestion(index)} type="button">
                          <span className="answer-option-key" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="answer-feedback" role="status" aria-live="polite">
                      <h3 ref={gameHeadingRef} tabIndex={-1}>
                        {selectedAnswer === currentQuestion.correctOptionIndex ? "Correct for this item." : "Not the keyed answer this time."}
                      </h3>
                      <p>{currentQuestion.explanation}</p>
                      <button className="button button-primary" onClick={continueRun} type="button">
                        {run.questionIndex === run.questions.length - 1 ? "See session result" : "Continue"}
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : null}
          {run.phase === "abandoned" ? (
            <>
              <p className="field-hint" role="status">Session left. No score or history was recorded.</p>
              <button className="text-button active-training-exit" onClick={() => setRun(null)} type="button">Return to training</button>
            </>
          ) : (
            <button className="text-button active-training-exit" onClick={leaveRun} type="button">Leave session</button>
          )}
        </section>
      ) : null}

      {result ? (
        <section className="training-result-card" aria-labelledby="training-result-title">
          <div className="training-card-topline">
            <span className="mini-label">{result.mode === "challenge" ? "CHALLENGE RESULT" : "PRACTICE RESULT"}</span>
            <span className="training-version">THIS ACTIVITY ONLY</span>
          </div>
          <h2 id="training-result-title" ref={resultHeadingRef} tabIndex={-1}>
            {result.correctCount} of {result.totalCount} correct
          </h2>
          <p>
            {result.mode === "challenge"
              ? "This score is self-reported and not independently verified. The challenge is untimed; time is not used for ranking. The copied result link includes this score; share it only with people you choose."
              : "This is a task-specific practice result, not a validated assessment or a measure of general ability."}
          </p>
          {result.mode === "challenge" && result.challengeCode && peerResult?.eventCode === result.challengeCode ? (
            <div className="challenge-comparison" role="status" aria-live="polite">
              <h3>Same-event comparison · self-reported</h3>
              <p>You: {result.correctCount}/{result.totalCount} · Shared report: {peerResult.correctCount}/{peerResult.totalCount}.</p>
              <p>
                {result.correctCount === peerResult.correctCount
                  ? "The reported scores match for this set."
                  : result.correctCount > peerResult.correctCount
                    ? "Your reported score is higher for this attempt."
                    : "The shared reported score is higher for this attempt."}
                {" "}This is not a verified rank; time is ignored and retries are allowed.
              </p>
            </div>
          ) : null}
          {result.mode === "challenge" && result.challengeCode ? (
            <button className="button button-quiet" onClick={() => shareResult(result)} type="button">
              Copy result and friend link
            </button>
          ) : null}
          {shareFeedback ? <p className="field-hint" role="status">{shareFeedback}</p> : null}
          {shareFallback ? (
            <label className="share-fallback-label" htmlFor="share-fallback">
              Share text (select and copy)
              <textarea id="share-fallback" rows={5} readOnly value={shareFallback} />
            </label>
          ) : null}
          <button className="text-button" onClick={() => setResult(null)} type="button">Return to training</button>
        </section>
      ) : null}

      <section className="training-section" id="goals" aria-labelledby="goals-title">
        <div className="training-section-heading">
          <div>
            <p className="section-kicker">GOALS / SET YOUR OWN PACE</p>
            <h2 id="goals-title">What would you like to practice?</h2>
          </div>
          <p>
            Pick a routine that fits your time. These are practice goals—not promises to change a broad cognitive ability.
          </p>
        </div>
        <div className="goal-program-grid">
          {GOAL_PROGRAMS.map((program) => (
            <article className={`goal-program-card${goalId === program.id ? " goal-program-selected" : ""}`} key={program.id}>
              <p className="mini-label">{program.weeklyTarget} SESSIONS / WEEK</p>
              <h3>{program.name}</h3>
              <p>{program.purpose}</p>
              <p className="field-hint">{program.description} {program.rationale}</p>
              <button className={goalId === program.id ? "button button-quiet" : "button button-outline"} onClick={() => chooseGoal(program.id)} type="button" aria-pressed={goalId === program.id} disabled={goalId === program.id}>
                {goalId === program.id ? "Current practice goal" : "Choose this goal"}
              </button>
            </article>
          ))}
        </div>

        <div className="goal-progress-card">
          <div className="goal-progress-copy">
            <p className="mini-label">YOUR ROUTINE, NOT A RANK</p>
            <h3>{selectedProgram ? selectedProgram.name : "You can start with free practice"}</h3>
            {selectedProgram ? (
              <>
                <p>{weeklyCount} of {selectedProgram.weeklyTarget} sessions from this goal’s activity set completed this UTC week. A matching challenge can count as one session; its score remains separate.</p>
                <progress aria-label="Practice sessions completed this UTC week" max={selectedProgram.weeklyTarget} value={Math.min(weeklyCount, selectedProgram.weeklyTarget)} />
                <p className="field-hint">A completed session is counted once. Reaching a target is optional; rest, pause, or change your goal at any time.</p>
                <section className="program-cycle-card" aria-label={`${selectedProgram.name} four-week schedule`}>
                  <div className="program-cycle-heading">
                    <p className="mini-label">FOUR-WEEK PRACTICE SCHEDULE</p>
                    <strong>{programTimeline ? `Week ${programTimeline.weekNumber} of ${selectedProgram.durationWeeks}` : "Ready to begin"}</strong>
                  </div>
                  {programTimeline && currentProgramWeek ? (
                    <>
                      <progress aria-label="Program weeks completed" max={selectedProgram.durationWeeks} value={programTimeline.completedWeeks} />
                      <h4>{currentProgramWeek.title}</h4>
                      <p>{currentProgramWeek.focus}</p>
                      {programTimeline.isComplete ? (
                        <p className="field-hint">The four-week schedule has elapsed. This marks time in the routine, not a change in ability.</p>
                      ) : null}
                      {programTimeline.isPaused ? (
                        <p className="field-hint" role="status">The schedule clock is paused. Resume when you want; any optional activity remains available.</p>
                      ) : null}
                      <button className="button button-quiet" onClick={programTimeline.isComplete ? startProgram : toggleProgramPause} type="button">
                        {programTimeline.isComplete ? "Start another four-week cycle" : programTimeline.isPaused ? "Resume schedule" : "Pause schedule"}
                      </button>
                      <details>
                        <summary>How activity feedback works</summary>
                        <p>{selectedProgram.feedback}</p>
                      </details>
                      <details>
                        <summary>Rest and recovery</summary>
                        <p>{selectedProgram.recoveryOption}</p>
                      </details>
                      <details>
                        <summary>Review this program</summary>
                        <p>{selectedProgram.reviewPrompt}</p>
                        <p className="field-hint">No reflection response is stored. Review is optional.</p>
                      </details>
                      <p className="field-hint">Stopping a schedule keeps your selected goal and session history.</p>
                      <button className="text-button" onClick={stopProgram} type="button">Stop schedule and keep history</button>
                    </>
                  ) : (
                    <>
                      <p>{selectedProgram.description} The schedule starts when you choose. If you stop, your selected goal and session history stay in place.</p>
                      <button className="button button-primary" onClick={startProgram} type="button">Start four-week program</button>
                    </>
                  )}
                </section>
                {nextActivity ? (
                  <>
                    <p className="next-session-note"><strong>Suggested next activity:</strong> {nextActivity.name} · about {nextActivity.minutes} minutes.</p>
                    <button className="button button-primary" disabled={Boolean(run)} onClick={() => startRun(nextActivity.id, "practice")} type="button">
                      Start suggested session
                    </button>
                  </>
                ) : null}
              </>
            ) : (
              <p>Choose any activity below, or select a goal above to get a simple weekly practice target.</p>
            )}
            {storageMessage || savedOnDevice ? (
              <p className="field-hint" role="status">{storageMessage || "Your saved goal and recent task results were loaded from this device."}</p>
            ) : null}
            <div className="goal-storage-actions">
              {!savedOnDevice && goalId ? (
                <button className="button button-quiet" onClick={enableLocalSave} type="button">Save this goal on this device</button>
              ) : null}
              {canManageProgress ? <button className="text-button" onClick={clearLocalSave} type="button">Clear saved goal and history</button> : null}
              {canExportProgress ? <button className="text-button" onClick={exportLocalSave} type="button">Export progress as JSON</button> : null}
              <span className="field-hint">
                {savedOnDevice
                  ? "This browser stores your goal, schedule dates, and recent task summaries—not raw answers, reflection text, or identity."
                  : hasStoredSave
                    ? "Your current changes are in page memory; an earlier saved copy may still remain on this device. Use clear or export controls here, or browser site-data settings if deletion cannot be confirmed."
                    : "Nothing is saved until you choose to save locally."}
              </span>
            </div>
          </div>
          <div className="recent-training" aria-labelledby="recent-training-title">
            <h4 id="recent-training-title">Recent sessions</h4>
            {sessions.length === 0 ? (
              <p className="field-hint">Completed activities appear here. Without local saving, this list lasts only until you leave or refresh.</p>
            ) : (
              <>
                <ol>
                  {sessions.slice(0, 4).map((session) => (
                    <li key={session.id}>
                      <span>
                        {gameName(session.activityId)}{session.mode === "challenge" ? " · challenge" : ""}
                        <time dateTime={session.completedAt}>{formatSessionDate(session.completedAt)}</time>
                      </span>
                      <strong>{session.correctCount}/{session.totalCount}</strong>
                    </li>
                  ))}
                </ol>
                <details className="recent-training-history">
                  <summary>View task-specific results by activity</summary>
                  <p>Each score belongs to one five-item set. Items and difficulty are not standardized across sessions; practice and device effects are not controlled. This history does not measure everyday skill or transfer. Compare cautiously within the same activity.</p>
                  <div className="task-history-groups">
                    {ACTIVITIES.filter((activity) => sessions.some((session) => session.activityId === activity.id)).map((activity) => (
                      <section key={activity.id} aria-labelledby={`history-${activity.id}`}>
                        <h5 id={`history-${activity.id}`}>{activity.name}</h5>
                        <ol>
                          {sessions.filter((session) => session.activityId === activity.id).map((session) => (
                            <li key={session.id}>
                              <time dateTime={session.completedAt}>{formatSessionDate(session.completedAt)}</time>
                              <span>{session.mode === "challenge" ? "Challenge" : "Practice"}</span>
                              <strong>{session.correctCount}/{session.totalCount}</strong>
                            </li>
                          ))}
                        </ol>
                      </section>
                    ))}
                  </div>
                </details>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="training-section activities-section" id="activities" aria-labelledby="activities-title">
        <div className="training-section-heading">
          <div>
            <p className="section-kicker">PLAYABLE ACTIVITIES / EIGHT SMALL PROTOTYPES</p>
            <h2 id="activities-title">Pick a game. See what it actually practices.</h2>
          </div>
          <p>These are early, deliberately small games. Each session explains its rule and scores only the answers in that set.</p>
        </div>
        <div className="training-game-grid">
          {ACTIVITIES.map((activity) => (
            <article className="training-game-card" key={activity.id}>
              <div className="training-card-topline">
                <span className="domain-pill">{activity.domain}</span>
                <span className="game-duration">About {activity.minutes} min</span>
              </div>
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
              <dl className="game-purpose">
                <div><dt>Practice focus</dt><dd>{activity.practiceFocus}</dd></div>
              </dl>
              <details className="game-contract-details">
                <summary>Rules, scoring, and access</summary>
                <dl>
                  <div><dt>Rules</dt><dd>{activity.rules}</dd></div>
                  <div><dt>Difficulty</dt><dd>{activity.difficulty}</dd></div>
                  <div><dt>Scoring</dt><dd>{activity.scoring}</dd></div>
                  <div><dt>Accessible path</dt><dd>{activity.accessibilityPath}</dd></div>
                  <div><dt>Score boundary</dt><dd>{activity.doesNotMeasure}</dd></div>
                </dl>
              </details>
              <p className="game-evidence-note">{activity.evidenceNote}</p>
              <button className="button button-primary" disabled={Boolean(run)} onClick={() => startRun(activity.id, "practice")} type="button">
                Start practice set
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="training-boundary" aria-labelledby="training-boundary-title">
        <p className="section-kicker">WHAT THIS FIRST BUILD DOES NOT CLAIM</p>
        <h2 id="training-boundary-title">Practice is not proof of transfer.</h2>
        <p>
          The scores above describe performance on these small tasks only. They are not IQ, EQ, diagnosis, health predictions, or evidence that skill transfers to everyday life. A public leaderboard, verified account system, migration of the existing external game portfolio, and broader human-development programs need separate design and review.
        </p>
      </section>
      <p className="training-footnote">{utcDate ? "Daily challenge date and code use UTC so participants receive the same versioned set." : ""}</p>
    </main>
  );
}
