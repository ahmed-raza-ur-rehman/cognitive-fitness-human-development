import {
  COACH_TOOL_NAMES,
  MAX_ANSWER_CHARS,
  MAX_CONTEXT_CHARS,
  MAX_QUESTION_CHARS,
  hasOnlyKeys,
  isPlainRecord,
  type CoachContextKind,
  type CoachContextSelection,
  type CoachRequest,
  type CoachToolName,
  type CoachToolRequest,
  type CoachTurn,
} from "@/lib/ai/contracts";
import {
  getEvidenceSourcesForClaim,
  getLimitationsForClaim,
  knowledgeGraph,
  type KnowledgeClaim,
} from "@/features/knowledge/content";
import { GOAL_PROGRAMS } from "@/features/goals/programs";
import { ACTIVITIES, GAME_IDS, type GameId } from "@/features/training/training-engine";

export type WorkspaceKind = "concept" | "game" | "challenge" | "evidence" | "goal" | "reflection";

export type WorkspaceDetail = {
  label: string;
  value: string;
};

export type WorkspaceReference = {
  label: string;
  url: string;
};

export type WorkspaceItem = {
  kind: WorkspaceKind;
  title: string;
  summary: string;
  details: WorkspaceDetail[];
  references?: WorkspaceReference[];
  href?: string;
  linkLabel?: string;
};

export type WorkspaceToolOption = {
  key: string;
  tool: Exclude<CoachToolName, "none">;
  targetId: string;
  group: string;
  label: string;
  context?: CoachContextSelection;
};

export const REFLECTION_PROMPTS = [
  {
    id: "session-fit",
    label: "Review what fit",
    prompt: "What felt clear or confusing in this activity? What, if anything, would you keep or change next time?",
  },
  {
    id: "pace-choice",
    label: "Notice the pace",
    prompt: "Did this pace and format fit what you wanted today? You can pause, skip, or choose another activity.",
  },
  {
    id: "access",
    label: "Check access and comfort",
    prompt: "What made this activity easier or harder to access? Is there an adjustment you would want before repeating it?",
  },
  {
    id: "next-step",
    label: "Choose a next step",
    prompt: "What would you like next: a related concept, a different activity, a closer look at evidence, or no activity at all?",
  },
] as const;

type ReflectionId = (typeof REFLECTION_PROMPTS)[number]["id"];

function contextOption(
  tool: WorkspaceToolOption["tool"],
  targetId: string,
  group: string,
  label: string,
  kind: CoachContextKind,
): WorkspaceToolOption {
  return {
    key: `${tool}:${targetId}`,
    tool,
    targetId,
    group,
    label,
    context: { kind, id: targetId },
  };
}

function toolOption(
  tool: WorkspaceToolOption["tool"],
  targetId: string,
  group: string,
  label: string,
): WorkspaceToolOption {
  return { key: `${tool}:${targetId}`, tool, targetId, group, label };
}

export const WORKSPACE_TOOL_OPTIONS: readonly WorkspaceToolOption[] = [
  ...knowledgeGraph.concepts.map((concept) =>
    contextOption("open_concept", concept.id, "Concepts", concept.title, "concept"),
  ),
  ...ACTIVITIES.map((activity) =>
    contextOption("open_game", activity.id, "Games and activities", activity.name, "game"),
  ),
  contextOption("open_challenge", "daily", "Challenges", "Daily challenge format", "challenge"),
  contextOption("open_challenge", "friend", "Challenges", "Friend challenge format", "challenge"),
  ...knowledgeGraph.claims.map((claim) =>
    contextOption("open_evidence", claim.id, "Evidence", claim.title, "evidence"),
  ),
  ...GOAL_PROGRAMS.map((program) =>
    contextOption("open_goal", program.id, "Practice goals", program.name, "goal"),
  ),
  ...REFLECTION_PROMPTS.map((prompt) =>
    toolOption("reflect", prompt.id, "Reflection", prompt.label),
  ),
];

export const COACH_CONTEXT_OPTIONS = WORKSPACE_TOOL_OPTIONS.filter(
  (option): option is WorkspaceToolOption & { context: CoachContextSelection } => Boolean(option.context),
);

const CONTEXT_TOOL_BY_KIND: Record<CoachContextKind, Exclude<CoachToolName, "none">> = {
  concept: "open_concept",
  game: "open_game",
  challenge: "open_challenge",
  evidence: "open_evidence",
  goal: "open_goal",
};

export function parseCoachContext(
  value: unknown,
): { ok: true; context: CoachContextSelection | null } | { ok: false } {
  if (value === null) return { ok: true, context: null };
  if (
    !isPlainRecord(value) ||
    !hasOnlyKeys(value, ["kind", "id"]) ||
    typeof value.kind !== "string" ||
    typeof value.id !== "string"
  ) {
    return { ok: false };
  }

  const selected = COACH_CONTEXT_OPTIONS.find(
    (option) => option.context.kind === value.kind && option.context.id === value.id,
  );
  return selected
    ? { ok: true, context: selected.context }
    : { ok: false };
}

export function parseCoachRequest(value: unknown): CoachRequest | null {
  if (
    !isPlainRecord(value) ||
    !hasOnlyKeys(value, ["question", "context", "adultConfirmed", "consent"]) ||
    !Object.hasOwn(value, "context") ||
    value.adultConfirmed !== true ||
    value.consent !== true ||
    typeof value.question !== "string"
  ) {
    return null;
  }

  const question = value.question.trim();
  if (
    question.length < 1 ||
    question.length > MAX_QUESTION_CHARS ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(question)
  ) {
    return null;
  }

  const parsedContext = parseCoachContext(value.context);
  if (!parsedContext.ok) return null;

  return {
    question,
    context: parsedContext.context,
    adultConfirmed: true,
    consent: true,
  };
}

function safeInternalUrl(url: string): string | undefined {
  return url.startsWith("/") && !url.startsWith("//") ? url : undefined;
}

function safeExternalUrl(url: string): string | undefined {
  try {
    return new URL(url).protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function authorsLabel(authors: string[]): string {
  return authors.length > 2 ? `${authors[0]}, ${authors[1]}, et al.` : authors.join(" & ");
}

function evidenceItem(claim: KnowledgeClaim): WorkspaceItem {
  const sources = getEvidenceSourcesForClaim(claim);
  const limitations = getLimitationsForClaim(claim);
  const references: WorkspaceReference[] = sources.flatMap((source) => {
    const sourceUrl = safeExternalUrl(source.url);
    const doiUrl = source.doi ? safeExternalUrl(`https://doi.org/${source.doi}`) : undefined;
    return [
      ...(sourceUrl ? [{ label: `Read ${source.title}`, url: sourceUrl }] : []),
      ...(doiUrl ? [{ label: `DOI: ${source.doi}`, url: doiUrl }] : []),
    ];
  });

  return {
    kind: "evidence",
    title: claim.title,
    summary: claim.wording,
    details: [
      { label: "Evidence framing", value: claim.evidenceLabel },
      { label: "Population", value: claim.population },
      { label: "Outcome", value: claim.outcome },
      { label: "Study design", value: claim.studyDesign },
      { label: "Transfer scope", value: claim.transferLevel.replaceAll("-", " ") },
      ...sources.map((source) => ({
        label: "Reviewed source",
        value: `${authorsLabel(source.authors)} (${source.year}). ${source.title}. ${source.publication}.`,
      })),
      ...limitations.map((limitation) => ({ label: "What this does not establish", value: limitation.text })),
    ],
    references,
    href: "/evidence",
    linkLabel: "Open the evidence library",
  };
}

export function resolveWorkspaceTool(request: {
  tool: string;
  targetId: string;
}): WorkspaceItem | null {
  const { tool, targetId } = request;

  if (tool === "open_concept") {
    const concept = knowledgeGraph.concepts.find((entry) => entry.id === targetId);
    if (!concept) return null;
    return {
      kind: "concept",
      title: concept.title,
      summary: concept.summary,
      details: [],
      href: safeInternalUrl(`/explore/${encodeURIComponent(concept.slug)}`),
      linkLabel: `Explore ${concept.title}`,
    };
  }

  if (tool === "open_game") {
    if (!GAME_IDS.includes(targetId as GameId)) return null;
    const activity = ACTIVITIES.find((entry) => entry.id === targetId);
    if (!activity) return null;
    return {
      kind: "game",
      title: activity.name,
      summary: activity.description,
      details: [
        { label: "Practice focus", value: activity.practiceFocus },
        { label: "Rules", value: activity.rules },
        { label: "Scoring", value: activity.scoring },
        { label: "What this set measures", value: activity.measures },
        { label: "What it does not measure", value: activity.doesNotMeasure },
        { label: "Access", value: activity.accessibilityPath },
        { label: "Time pressure", value: activity.timePressure },
      ],
      href: "/train#activities",
      linkLabel: "Browse all practice activities",
    };
  }

  if (tool === "open_challenge") {
    if (targetId === "daily") {
      return {
        kind: "challenge",
        title: "Daily challenge format",
        summary: "An optional, fixed-question set for the UTC date. It is an activity-specific challenge, not a public competition service.",
        details: [
          { label: "Verification", value: "Runs and results are client-side; there is no server-verified ranking. Results are self-reported and unverified." },
          { label: "Comparison", value: "The same date-bound challenge is untimed; compare only the named activity and do not infer broader ability." },
          { label: "Shared data", value: "This guide tool shares no challenge code, score, or play history with the AI provider." },
        ],
        href: "/train#daily-challenge-title",
        linkLabel: "View today's challenge details",
      };
    }
    if (targetId === "friend") {
      return {
        kind: "challenge",
        title: "Friend challenge format",
        summary: "A user-created, shareable fixed set for one activity. It is not a verified competition or public leaderboard.",
        details: [
          { label: "Verification", value: "Anyone with a code may retry; identity, clock, and attempt limits are not server-enforced. Results are self-reported and unverified." },
          { label: "Comparison", value: "A comparison belongs to that event and task only; it is not a general ability rank." },
          { label: "Shared data", value: "This guide tool shares no challenge code, score, or play history with the AI provider." },
        ],
        href: "/train#daily-challenge-title",
        linkLabel: "View friend challenge options",
      };
    }
    return null;
  }

  if (tool === "open_evidence") {
    const claim = knowledgeGraph.claims.find((entry) => entry.id === targetId);
    return claim ? evidenceItem(claim) : null;
  }

  if (tool === "open_goal") {
    const program = GOAL_PROGRAMS.find((entry) => entry.id === targetId);
    if (!program) return null;
    return {
      kind: "goal",
      title: program.name,
      summary: program.purpose,
      details: [
        { label: "Program format", value: program.description },
        { label: "Optional weekly target", value: `${program.weeklyTarget} sessions per week` },
        { label: "Duration", value: `${program.durationWeeks} weeks` },
        { label: "Rationale", value: program.rationale },
        { label: "Rest option", value: program.recoveryOption },
        ...program.weeks.map((week, index) => ({ label: `Week ${index + 1}: ${week.title}`, value: week.focus })),
      ],
      href: "/train#goals",
      linkLabel: "View practice goals",
    };
  }

  if (tool === "reflect") {
    const prompt = REFLECTION_PROMPTS.find((entry) => entry.id === targetId as ReflectionId);
    if (!prompt) return null;
    return {
      kind: "reflection",
      title: prompt.label,
      summary: prompt.prompt,
      details: [{ label: "Privacy", value: "Any note you write below stays in this page's local memory. It is not saved or sent to the AI provider." }],
    };
  }

  return null;
}

export function buildProviderContext(context: CoachContextSelection | null): {
  kind: WorkspaceKind;
  title: string;
  summary: string;
  details: WorkspaceDetail[];
} | null {
  if (!context) return null;
  const tool = CONTEXT_TOOL_BY_KIND[context.kind];
  const item = resolveWorkspaceTool({ tool, targetId: context.id });
  if (!item || item.kind === "reflection") return null;

  const candidate = {
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    details: item.details,
  };
  if (JSON.stringify(candidate).length <= MAX_CONTEXT_CHARS) return candidate;

  const compact = {
    kind: item.kind,
    title: item.title.slice(0, 120),
    summary: item.summary.slice(0, 900),
    details: item.details.slice(0, 2).map((detail) => ({
      label: detail.label.slice(0, 80),
      value: detail.value.slice(0, 600),
    })),
  };
  if (JSON.stringify(compact).length <= MAX_CONTEXT_CHARS) return compact;

  return {
    kind: item.kind,
    title: item.title.slice(0, 120),
    summary: item.summary.slice(0, 500),
    details: [],
  };
}

export function getProviderToolCatalog(): string {
  return WORKSPACE_TOOL_OPTIONS.map(
    (option) => `${option.tool} | ${option.targetId} | ${option.label}`,
  ).join("\n");
}

export function parseModelTurn(text: string): CoachTurn | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }

  if (
    !isPlainRecord(value) ||
    !hasOnlyKeys(value, ["answer", "action"]) ||
    typeof value.answer !== "string" ||
    !isPlainRecord(value.action) ||
    !hasOnlyKeys(value.action, ["tool", "targetId"]) ||
    typeof value.action.tool !== "string" ||
    !COACH_TOOL_NAMES.includes(value.action.tool as CoachToolName) ||
    typeof value.action.targetId !== "string"
  ) {
    return null;
  }

  const answer = value.answer.trim();
  if (answer.length < 1 || answer.length > MAX_ANSWER_CHARS) return null;

  if (value.action.tool === "none") {
    return value.action.targetId === "" ? { answer, workspaceItem: null } : null;
  }

  const workspaceItem = resolveWorkspaceTool({
    tool: value.action.tool,
    targetId: value.action.targetId,
  });
  return workspaceItem ? { answer, workspaceItem } : null;
}

export function isContextKind(value: unknown): value is CoachContextKind {
  return typeof value === "string" && ["concept", "game", "challenge", "evidence", "goal"].includes(value);
}

export function isCoachToolName(value: unknown): value is CoachToolName {
  return typeof value === "string" && COACH_TOOL_NAMES.includes(value as CoachToolName);
}

export function isToolRequest(value: unknown): value is CoachToolRequest {
  if (
    !isPlainRecord(value) ||
    !hasOnlyKeys(value, ["tool", "targetId"]) ||
    !isCoachToolName(value.tool) ||
    typeof value.targetId !== "string"
  ) return false;
  if (value.tool === "none") return value.targetId === "";
  return resolveWorkspaceTool({ tool: value.tool, targetId: value.targetId }) !== null;
}
