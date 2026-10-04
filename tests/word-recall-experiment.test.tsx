import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WordRecallExperiment } from "../src/features/experiment/word-recall-experiment";

describe("WordRecallExperiment", () => {
  it("keeps the list self-paced and explains a task-specific result and its limits", () => {
    render(<WordRecallExperiment />);

    expect(screen.getByText(/no timer/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show the word list" }));

    const wordList = screen.getByRole("list", { name: "Six words to look at" });
    expect(wordList).toBeInTheDocument();
    expect(wordList).toHaveTextContent("lamp");
    expect(document.activeElement).toHaveTextContent("Take the time you need.");

    fireEvent.click(screen.getByRole("button", { name: "Hide list and recall" }));
    expect(screen.queryByRole("list", { name: "Six words to look at" })).not.toBeInTheDocument();
    expect(document.activeElement).toHaveTextContent("Which words come to mind?");

    fireEvent.change(screen.getByRole("textbox", { name: "Words you recall" }), {
      target: { value: "LAMP, river\nriver, dragon" },
    });
    fireEvent.click(screen.getByRole("button", { name: "See this round’s result" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "You recalled 2 of 6 words in this round.",
    );
    expect(screen.getByText("lamp, river")).toBeInTheDocument();
    expect(screen.getByText(/Repeated words were counted once/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What this result means" })).toBeInTheDocument();
    expect(screen.getByText(/not a validated test/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the research context and limits/i }))
      .toHaveAttribute("href", "#lab-evidence");
    expect(document.activeElement).toHaveTextContent("Your recall result");

    fireEvent.click(screen.getByRole("button", { name: "Try another round" }));
    expect(screen.getByRole("heading", { name: "Start when you’re ready." })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(document.activeElement).toHaveTextContent("Start when you’re ready.");
  });

  it("accepts a blank response as zero and does not reveal a score before submission", () => {
    render(<WordRecallExperiment />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show the word list" }));
    fireEvent.click(screen.getByRole("button", { name: "Hide list and recall" }));
    fireEvent.click(screen.getByRole("button", { name: "See this round’s result" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "You recalled 0 of 6 words in this round.",
    );
    expect(screen.getByText("None this round")).toBeInTheDocument();
  });

  it("shows an announced validation message and keeps overlong input available to edit", () => {
    render(<WordRecallExperiment />);
    fireEvent.click(screen.getByRole("button", { name: "Show the word list" }));
    fireEvent.click(screen.getByRole("button", { name: "Hide list and recall" }));

    const response = screen.getByRole("textbox", { name: "Words you recall" });
    fireEvent.change(response, { target: { value: "x".repeat(1_001) } });
    fireEvent.click(screen.getByRole("button", { name: "See this round’s result" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/shorten it and try again/i);
    expect(response).toHaveValue("x".repeat(1_001));
    expect(response).toHaveAttribute("aria-describedby", "recall-help recall-error");
    expect(response).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
