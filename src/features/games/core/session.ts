import type {
  CreateGameSessionOptions,
  GameSession,
  GameSessionAction,
  ScoredQuestion,
} from "./contracts";

export function createGameSession<Question extends ScoredQuestion, GameKey extends string>(
  options: CreateGameSessionOptions<Question, GameKey>,
): GameSession<Question, GameKey> {
  if (!options.sessionId.trim() || !options.gameId.trim() || !options.gameVersion.trim() || !options.seed.trim()) {
    throw new Error("A session id, game id, game version, and seed are required.");
  }
  if (options.questions.length === 0) {
    throw new Error("A game session must include at least one question.");
  }

  const questionIds = new Set<string>();
  for (const question of options.questions) {
    if (!question.id.trim() || questionIds.has(question.id)) {
      throw new Error("Every question in a session must have a unique, non-empty id.");
    }
    questionIds.add(question.id);
    if (
      question.options.length < 2 ||
      !Number.isInteger(question.correctOptionIndex) ||
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex >= question.options.length
    ) {
      throw new Error(`Question ${question.id} has an invalid answer key.`);
    }
  }

  return {
    sessionId: options.sessionId,
    gameId: options.gameId,
    gameVersion: options.gameVersion,
    mode: options.mode,
    seed: options.seed,
    ...(options.challengeCode ? { challengeCode: options.challengeCode } : {}),
    questions: options.questions,
    questionIndex: 0,
    answers: options.questions.map(() => null),
    phase: options.initialPhase,
  };
}

export function reduceGameSession<Question extends ScoredQuestion, GameKey extends string>(
  session: GameSession<Question, GameKey>,
  action: GameSessionAction,
): GameSession<Question, GameKey> {
  if (session.phase === "completed" || session.phase === "abandoned") return session;

  if (action.type === "leave") return { ...session, phase: "abandoned" };
  if (action.type === "hide-stimulus") {
    return session.phase === "study" ? { ...session, phase: "answer" } : session;
  }
  if (action.type === "submit-answer") {
    const question = session.questions[session.questionIndex];
    if (
      session.phase !== "answer" ||
      !question ||
      !Number.isInteger(action.optionIndex) ||
      action.optionIndex < 0 ||
      action.optionIndex >= question.options.length
    ) return session;

    const answers = [...session.answers];
    answers[session.questionIndex] = action.optionIndex;
    return { ...session, answers, phase: "feedback" };
  }
  if (action.type === "continue") {
    if (session.phase !== "feedback") return session;
    if (session.questionIndex === session.questions.length - 1) {
      return { ...session, phase: "completed" };
    }
    return {
      ...session,
      questionIndex: session.questionIndex + 1,
      phase: action.nextPhase,
    };
  }
  return session;
}
