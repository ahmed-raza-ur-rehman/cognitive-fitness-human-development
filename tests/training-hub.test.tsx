import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrainingHub } from "@/features/training/training-hub";
import { createSelfReportedResultCode, createWeeklyFriendChallenge, getUtcWeekStart } from "@/features/competition/challenges";
import { ACTIVITIES, GOAL_PROGRAMS, getDailyChallenge, TRAINING_STORAGE_KEY } from "@/features/training/training-engine";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/train");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TrainingHub", () => {
  it("offers a user-led practice goal and only saves after an explicit choice", async () => {
    render(<TrainingHub />);

    const goalCard = screen.getByRole("heading", { name: "Explore memory" }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));
    expect(within(goalCard as HTMLElement).getByRole("button", { name: "Current practice goal" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Week 1 of 4")).toBeInTheDocument();
    expect(window.localStorage.getItem(TRAINING_STORAGE_KEY)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Save this goal on this device" }));
    expect(JSON.parse(window.localStorage.getItem(TRAINING_STORAGE_KEY) ?? "{}")).toMatchObject({
      version: 1, goalId: "memory", sessions: [], programProgress: { pausedAt: null, pausedDurationMs: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause schedule" }));
    expect(JSON.parse(window.localStorage.getItem(TRAINING_STORAGE_KEY) ?? "{}").programProgress.pausedAt).toEqual(expect.any(String));
    fireEvent.click(screen.getByRole("button", { name: "Resume schedule" }));
    expect(JSON.parse(window.localStorage.getItem(TRAINING_STORAGE_KEY) ?? "{}").programProgress.pausedAt).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Stop schedule and keep history" }));
    expect(JSON.parse(window.localStorage.getItem(TRAINING_STORAGE_KEY) ?? "{}")).toMatchObject({
      goalId: "memory", sessions: [], programProgress: null,
    });
    expect(screen.getByRole("button", { name: "Start four-week program" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear saved goal and history" }));
    expect(window.localStorage.getItem(TRAINING_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("cleared from this device");
  });

  it("keeps schedule controls usable in page memory after local storage fails", () => {
    render(<TrainingHub />);
    const goalCard = screen.getByRole("heading", { name: "Explore memory" }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));
    fireEvent.click(screen.getByRole("button", { name: "Save this goal on this device" }));

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause schedule" }));
    expect(screen.getByText(/could not save your data/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear saved goal and history" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export progress as JSON" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume schedule" }));
    expect(screen.getByRole("button", { name: "Pause schedule" })).toBeInTheDocument();
    expect(screen.queryByText(/schedule clock is paused/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop schedule and keep history" }));
    expect(screen.getByRole("button", { name: "Start four-week program" })).toBeInTheDocument();
  });

  it("clears in-memory history and warns if browser deletion cannot be confirmed", () => {
    window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify({
      version: 1, goalId: "memory", sessions: [],
    }));
    render(<TrainingHub />);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear saved goal and history" }));
    expect(screen.getByText(/page history was cleared, but the browser could not confirm deletion/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You can start with free practice" })).toBeInTheDocument();
    expect(window.localStorage.getItem(TRAINING_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByRole("button", { name: "Clear saved goal and history" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export progress as JSON" })).not.toBeInTheDocument();
  });

  it("pauses and resumes the schedule clock without making goals mandatory", () => {
    render(<TrainingHub />);
    const goalCard = screen.getByRole("heading", { name: "Explore memory" }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause schedule" }));
    expect(screen.getByRole("status")).toHaveTextContent("schedule clock is paused");
    expect(screen.getByRole("button", { name: "Resume schedule" })).toBeInTheDocument();
    expect(window.localStorage.getItem(TRAINING_STORAGE_KEY)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Resume schedule" }));
    expect(screen.queryByText(/schedule clock is paused/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause schedule" })).toBeInTheDocument();
  });

  it("migrates a version-one saved goal without program metadata", () => {
    window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify({ version: 1, goalId: "reasoning", sessions: [] }));
    render(<TrainingHub />);
    expect(screen.getByRole("button", { name: "Start four-week program" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start four-week program" }));
    expect(screen.getByText("Week 1 of 4")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(TRAINING_STORAGE_KEY) ?? "{}")).toMatchObject({
      programProgress: { pausedAt: null, pausedDurationMs: 0 },
    });
  });

  it("runs the memory game's manual-hide step and presents answer feedback", () => {
    render(<TrainingHub />);

    const gameCard = screen.getByRole("heading", { name: "Sequence Recall" }).closest("article");
    expect(gameCard).not.toBeNull();
    fireEvent.click(within(gameCard as HTMLElement).getByRole("button", { name: "Start practice set" }));

    const studyHeading = screen.getByText("Study this sequence for as long as you need.");
    expect(studyHeading).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Hide sequence and answer" }));
    expect(screen.getByRole("heading", { name: /Which option matches/ })).toHaveFocus();

    const answers = within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button");
    fireEvent.click(answers[0]);
    expect(screen.getByRole("heading", { name: /Correct for this item|Not the keyed answer this time/ })).toHaveFocus();
  });

  it("runs the spatial-memory manual-hide interaction with a labelled grid", () => {
    render(<TrainingHub />);
    const gameCard = screen.getByRole("heading", { name: "Grid Pattern Recall" }).closest("article");
    expect(gameCard).not.toBeNull();
    fireEvent.click(within(gameCard as HTMLElement).getByRole("button", { name: "Start practice set" }));
    expect(screen.getByRole("heading", { name: "Study this cell pattern for as long as you need." })).toHaveFocus();
    expect(screen.getByRole("table", { name: /Study grid/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide pattern and answer" }));
    expect(screen.getByRole("heading", { name: /Which set of marked cells matches/ })).toHaveFocus();
    fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
    expect(screen.getByRole("heading", { name: /Correct for this item|Not the keyed answer this time/ })).toHaveFocus();
  });

  it("shows a semantic map and valid route choices in Route Planner", () => {
    render(<TrainingHub />);
    const gameCard = screen.getByRole("heading", { name: "Route Planner" }).closest("article");
    expect(gameCard).not.toBeNull();
    fireEvent.click(within(gameCard as HTMLElement).getByRole("button", { name: "Start practice set" }));
    expect(screen.getByRole("table", { name: /Route map/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Which route reaches Goal/ })).toHaveFocus();
    expect(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")).toHaveLength(4);
  });

  it("can complete a five-item session for every visible game card", () => {
    render(<TrainingHub />);

    for (const activity of ACTIVITIES) {
      const gameCard = screen.getByRole("heading", { name: activity.name }).closest("article");
      expect(gameCard).not.toBeNull();
      fireEvent.click(within(gameCard as HTMLElement).getByRole("button", { name: "Start practice set" }));

      for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
        const hideSequenceButton = screen.queryByRole("button", { name: "Hide sequence and answer" });
        if (hideSequenceButton) fireEvent.click(hideSequenceButton);
        const hideMatrixButton = screen.queryByRole("button", { name: "Hide pattern and answer" });
        if (hideMatrixButton) fireEvent.click(hideMatrixButton);
        fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
        fireEvent.click(screen.getByRole("button", { name: questionIndex === 4 ? "See session result" : "Continue" }));
      }

      expect(screen.getByRole("heading", { name: /of 5 correct/ })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Return to training" }));
    }
  }, 15_000);

  it("leaves a session without recording a score or history entry", () => {
    render(<TrainingHub />);
    const gameCard = screen.getByRole("heading", { name: "Pattern Predictor" }).closest("article");
    expect(gameCard).not.toBeNull();
    fireEvent.click(within(gameCard as HTMLElement).getByRole("button", { name: "Start practice set" }));
    fireEvent.click(screen.getByRole("button", { name: "Leave session" }));
    expect(screen.getByRole("status")).toHaveTextContent("No score or history was recorded");
    fireEvent.click(screen.getByRole("button", { name: "Return to training" }));
    expect(screen.queryByRole("heading", { name: "Practice result" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent sessions" })).toBeInTheDocument();
  });

  it("loads a versioned friend challenge code and exposes the matching dated set", () => {
    const challenge = getDailyChallenge("2026-10-01");
    render(<TrainingHub />);

    fireEvent.click(screen.getByText("Have a friend’s challenge code?"));
    fireEvent.change(screen.getByRole("textbox", { name: "Challenge code" }), { target: { value: challenge.code } });
    fireEvent.click(screen.getByRole("button", { name: "Load challenge" }));

    expect(screen.getByRole("status")).toHaveTextContent("Challenge loaded");
    expect(screen.getByRole("button", { name: /Play loaded challenge/ })).toBeInTheDocument();
  });

  it("completes a fixed daily challenge, reports task-only accuracy, and records the session in memory", () => {
    render(<TrainingHub />);
    fireEvent.click(screen.getByRole("button", { name: "Play today’s challenge" }));

    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      const hideSequenceButton = screen.queryByRole("button", { name: "Hide sequence and answer" });
      if (hideSequenceButton) fireEvent.click(hideSequenceButton);

      const answerGroup = screen.getByRole("group", { name: "Answer choices" });
      fireEvent.click(within(answerGroup).getAllByRole("button")[0]);
      fireEvent.click(screen.getByRole("button", {
        name: questionIndex === 4 ? "See session result" : "Continue",
      }));
    }

    expect(screen.getByRole("heading", { name: /of 5 correct/ })).toBeInTheDocument();
    expect(screen.getByText(/self-reported and not independently verified/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent sessions" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("View task-specific results by activity"));
    expect(screen.getByText(/practice and device effects are not controlled/i)).toBeInTheDocument();
  });

  it("limits weekly friend-event games to the active goal and counts a matching completed event", () => {
    render(<TrainingHub />);
    const goalCard = screen.getByRole("heading", { name: "Explore memory" }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));

    fireEvent.click(screen.getByText("Create a weekly friend challenge"));
    const gameSelect = screen.getByRole("combobox", { name: "Game for this event" });
    expect(within(gameSelect).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Sequence Recall",
      "Grid Pattern Recall",
    ]);
    fireEvent.change(gameSelect, { target: { value: "matrix-memory" } });
    fireEvent.click(screen.getByRole("button", { name: "Create this week’s friend challenge" }));

    const eventCode = screen.getByText(/CF3-\d{8}-MATRIXMEMORY-V1-0-0/).textContent;
    expect(eventCode).toBeTruthy();
    expect(screen.getByRole("region", { name: "Weekly friend challenge details" })).toHaveTextContent("five questions · untimed · correct-count only");
    fireEvent.click(screen.getByRole("button", { name: "Play this weekly set" }));

    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      const hidePatternButton = screen.queryByRole("button", { name: "Hide pattern and answer" });
      if (hidePatternButton) fireEvent.click(hidePatternButton);
      fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
      fireEvent.click(screen.getByRole("button", { name: questionIndex === 4 ? "See session result" : "Continue" }));
    }

    expect(screen.getByRole("heading", { name: /of 5 correct/ })).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 sessions from this goal’s activity set completed this UTC week/)).toBeInTheDocument();
    expect(screen.getByText("Grid Pattern Recall · challenge")).toBeInTheDocument();
  });

  it("prevents a loaded weekly event from starting after its displayed UTC window", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const currentWeek = getUtcWeekStart(today);
    expect(currentWeek).not.toBeNull();
    const previousWeekDate = new Date(`${currentWeek as string}T00:00:00.000Z`);
    previousWeekDate.setUTCDate(previousWeekDate.getUTCDate() - 7);
    const challenge = createWeeklyFriendChallenge(previousWeekDate.toISOString().slice(0, 10), "logic");
    window.history.replaceState({}, "", `/train?challenge=${encodeURIComponent(challenge.code)}`);

    render(<TrainingHub />);
    await screen.findByText("This event week has ended. You can inspect its code, but cannot start a new attempt.");
    expect(screen.getByRole("button", { name: "Play this weekly set" })).toBeDisabled();
  });

  it("does not count a completed daily challenge outside the selected goal's activity set", () => {
    const today = new Date().toISOString().slice(0, 10);
    const challenge = getDailyChallenge(today);
    const program = GOAL_PROGRAMS.find((candidate) => !candidate.activityIds.includes(challenge.gameId));
    expect(program).toBeDefined();
    if (!program) return;

    render(<TrainingHub />);
    const goalCard = screen.getByRole("heading", { name: program.name }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));
    expect(screen.getByText(new RegExp(`This activity is outside ${program.name}`))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play today’s challenge" }));

    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      const hideSequenceButton = screen.queryByRole("button", { name: "Hide sequence and answer" });
      if (hideSequenceButton) fireEvent.click(hideSequenceButton);
      const hidePatternButton = screen.queryByRole("button", { name: "Hide pattern and answer" });
      if (hidePatternButton) fireEvent.click(hidePatternButton);
      fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
      fireEvent.click(screen.getByRole("button", { name: questionIndex === 4 ? "See session result" : "Continue" }));
    }

    expect(screen.getByText(new RegExp(`0 of ${program.weeklyTarget} sessions from this goal’s activity set completed this UTC week`))).toBeInTheDocument();
  });

  it("labels an imported friend event outside the selected goal and excludes it from adherence", () => {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = getUtcWeekStart(today);
    expect(weekStart).not.toBeNull();
    const challenge = createWeeklyFriendChallenge(weekStart as string, "logic");
    window.history.replaceState({}, "", `/train?challenge=${encodeURIComponent(challenge.code)}`);

    render(<TrainingHub />);
    const goalCard = screen.getByRole("heading", { name: "Explore memory" }).closest("article");
    expect(goalCard).not.toBeNull();
    fireEvent.click(within(goalCard as HTMLElement).getByRole("button", { name: "Choose this goal" }));
    expect(screen.getByText(/This friend event is outside Explore memory.*will not count/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play this weekly set" }));

    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
      fireEvent.click(screen.getByRole("button", { name: questionIndex === 4 ? "See session result" : "Continue" }));
    }

    expect(screen.getByText(/0 of 2 sessions from this goal’s activity set completed this UTC week/)).toBeInTheDocument();
  });

  it("compares a shared self-reported result only after a matching challenge run", () => {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = getUtcWeekStart(today);
    expect(weekStart).not.toBeNull();
    const challenge = createWeeklyFriendChallenge(weekStart as string, "logic");
    const resultCode = createSelfReportedResultCode(challenge.code, 3, 5);
    expect(resultCode).not.toBeNull();
    window.history.replaceState({}, "", `/train?challenge=${encodeURIComponent(challenge.code)}&result=${encodeURIComponent(resultCode as string)}`);

    render(<TrainingHub />);
    expect(screen.getByRole("region", { name: "Weekly friend challenge details" })).toHaveTextContent("An unverified self-reported result of 3/5 is attached to this exact event");
    fireEvent.click(screen.getByRole("button", { name: "Play this weekly set" }));

    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button")[0]);
      fireEvent.click(screen.getByRole("button", { name: questionIndex === 4 ? "See session result" : "Continue" }));
    }

    expect(screen.getByRole("heading", { name: "Same-event comparison · self-reported" })).toBeInTheDocument();
    expect(screen.getByText(/You: \d\/5 · Shared report: 3\/5/)).toBeInTheDocument();
    expect(screen.getByText(/not a verified rank; time is ignored and retries are allowed/)).toBeInTheDocument();
  });
});
