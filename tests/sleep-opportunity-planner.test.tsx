import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SleepOpportunityPlanner } from "../src/features/knowledge/sleep-opportunity-planner";

describe("sleep-opportunity planner", () => {
  it("calculates a previous-day window from the user's chosen inputs without saving data", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { container } = render(<SleepOpportunityPlanner />);
    expect(container.querySelector("form")).toBeNull();

    fireEvent.change(screen.getByLabelText(/wake-up time on your local clock/i), {
      target: { value: "06:30" },
    });
    fireEvent.change(screen.getByLabelText(/hours you choose to leave open for sleep/i), {
      target: { value: "8" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(/start at 10:30 PM on the previous day/i);
    expect(screen.getByRole("status")).toHaveTextContent(/clock arithmetic only/i);
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("shows a non-alarmist guardrail instead of a calculated start for a window under seven hours", () => {
    render(<SleepOpportunityPlanner />);
    fireEvent.change(screen.getByLabelText(/wake-up time on your local clock/i), {
      target: { value: "06:30" },
    });
    fireEvent.change(screen.getByLabelText(/hours you choose to leave open for sleep/i), {
      target: { value: "6.5" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(/shorter than 7 hours/i);
    expect(screen.getByRole("status")).toHaveTextContent(/actual sleep for healthy adults aged 18–60/i);
    expect(screen.getByRole("status")).not.toHaveTextContent(/window would start at/i);
  });

  it("handles a same-day calculation, then lets the user clear both entries", () => {
    render(<SleepOpportunityPlanner />);
    const wakeTime = screen.getByLabelText(/wake-up time on your local clock/i);
    const hours = screen.getByLabelText(/hours you choose to leave open for sleep/i);

    fireEvent.change(wakeTime, { target: { value: "14:00" } });
    fireEvent.change(hours, { target: { value: "8" } });
    expect(screen.getByRole("status")).toHaveTextContent(/start at 6:00 AM on the same day/i);

    fireEvent.click(screen.getByRole("button", { name: /clear entries/i }));
    expect(wakeTime).toHaveValue("");
    expect(hours).toHaveValue(null);
    expect(screen.getByRole("status")).toHaveTextContent(/nothing is estimated until you do/i);
  });

  it("rejects values outside the planner's half-hour input steps", () => {
    render(<SleepOpportunityPlanner />);
    fireEvent.change(screen.getByLabelText(/wake-up time on your local clock/i), {
      target: { value: "06:30" },
    });
    fireEvent.change(screen.getByLabelText(/hours you choose to leave open for sleep/i), {
      target: { value: "7.25" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(/enter a window from 0.5 to 16 hours in half-hour steps/i);
  });
});
