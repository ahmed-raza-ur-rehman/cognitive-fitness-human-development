import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ProgressPanel } from "@/features/progress/progress-panel";
import ProgressPage from "@/app/progress/page";
import { TRAINING_STORAGE_KEY } from "@/features/training/training-engine";

function seed(state: unknown) {
  window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state));
}

describe("progress panel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("explains that nothing is available until the user opts in to saving", () => {
    render(<ProgressPanel />);

    expect(screen.getByText(/nothing is saved on this device yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /turn on local saving/i })).toHaveAttribute("href", "/train#active-training");
    expect(screen.getByText(/cannot show what happened in another browser/i)).toBeInTheDocument();
  });

  it("describes saved sessions per activity with ranges instead of a combined score", () => {
    seed({
      version: 1,
      goalId: null,
      programProgress: null,
      sessions: [
        { id: "a", activityId: "sequence", mode: "practice", correctCount: 5, totalCount: 5, completedAt: "2026-10-01T10:00:00.000Z" },
        { id: "b", activityId: "sequence", mode: "practice", correctCount: 2, totalCount: 5, completedAt: "2026-10-02T10:00:00.000Z" },
        { id: "c", activityId: "logic", mode: "challenge", correctCount: 4, totalCount: 5, completedAt: "2026-10-03T10:00:00.000Z" },
      ],
    });
    render(<ProgressPanel />);

    const table = screen.getByRole("table", { name: /saved sessions per activity/i });
    expect(screen.getByRole("link", { name: /export or clear these records/i })).toHaveAttribute("href", "/train#active-training");
    expect(table).toBeInTheDocument();
    expect(screen.getByText("Sequence Recall")).toBeInTheDocument();
    expect(screen.getByText("Logic Lab")).toBeInTheDocument();
    // Two rows, each with its own range: no pooling across activities.
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText(/11 of 15 items were recorded as correct/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /three things these numbers cannot say/i })).toBeInTheDocument();
    expect(screen.getByText(/do not measure change in ability/i)).toBeInTheDocument();
    expect(screen.getByText(/not comparable across devices or people/i)).toBeInTheDocument();
  });

  it("shows the chosen schedule as an observed count, never as a streak", () => {
    const now = new Date();
    const sessionStamp = now.toISOString();
    const startStamp = new Date(now.getTime() - 86_400_000).toISOString();

    seed({
      version: 1,
      goalId: "memory",
      programProgress: { startedAt: startStamp, pausedAt: null, pausedDurationMs: 0 },
      sessions: [
        { id: "a", activityId: "sequence", mode: "practice", correctCount: 4, totalCount: 5, completedAt: sessionStamp },
      ],
    });
    render(<ProgressPanel />);

    expect(screen.getByText(/week 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/1 matching session is recorded so far/i)).toBeInTheDocument();
    expect(screen.getByText(/not a measure of discipline/i)).toBeInTheDocument();
    expect(screen.getByText(/adherence counts the sessions you kept/i)).toBeInTheDocument();
    // Cadence is described, but no streak counter or penalty language is created.
    expect(screen.queryByText(/current streak|longest streak|days in a row/i)).not.toBeInTheDocument();
  });

  it("renders honest framing on the page shell itself", () => {
    render(<ProgressPage />);

    expect(screen.getByRole("heading", { level: 1, name: /your saved practice, described carefully/i })).toBeInTheDocument();
    expect(screen.getByText(/not an assessment, a diagnosis/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /where the numbers came from/i })).toBeInTheDocument();
  });

  it("reacts when another tab clears the saved copy", () => {
    seed({ version: 1, goalId: null, programProgress: null, sessions: [
      { id: "a", activityId: "sequence", mode: "practice", correctCount: 1, totalCount: 5, completedAt: "2026-10-02T09:00:00.000Z" },
    ] });
    const { rerender } = render(<ProgressPanel />);
    expect(screen.getByRole("table", { name: /saved sessions per activity/i })).toBeInTheDocument();

    window.localStorage.clear();
    rerender(<ProgressPanel />);
    fireEvent(window, new Event("storage"));

    expect(screen.getByText(/nothing is saved on this device yet/i)).toBeInTheDocument();
  });
});
