import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEVELOPMENT_ATLAS } from "@/features/development/content";
import { DevelopmentAtlas } from "@/features/development/development-atlas";
import DevelopPage from "@/app/develop/page";

describe("DevelopmentAtlas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all four clusters and 14 distinct, accessible pathways", () => {
    render(<DevelopmentAtlas />);

    expect(screen.getByRole("navigation", { name: "Development areas" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(14);
    for (const cluster of DEVELOPMENT_ATLAS.clusters) {
      expect(screen.getByRole("heading", { level: 2, name: cluster.title })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: cluster.title })).toHaveAttribute("href", `#${cluster.id}`);
    }
    expect(screen.getByRole("heading", { name: /make a small practice menu/i })).toBeInTheDocument();
    expect(screen.getByText(/no reflection or health details are requested or stored/i)).toBeInTheDocument();
    expect(screen.getByText(/there is no required number of sessions; when three are selected, remove one/i)).toBeInTheDocument();
  });

  it("adds, removes, and limits optional selections without persisting them", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<DevelopmentAtlas />);

    const memoryButton = screen.getByRole("button", { name: /add memory & learning to the practice menu/i });
    fireEvent.click(memoryButton);
    expect(screen.getByRole("button", { name: /remove memory & learning from the practice menu/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/memory & learning added/i);
    expect(screen.getByText(/1 of 3 areas selected/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add attention & executive skills to the practice menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /add reasoning, problem-solving & decisions to the practice menu/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/3 of 3 areas selected/i);

    expect(screen.getByRole("button", { name: /add metacognition & self-regulated learning to the practice menu/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /remove memory & learning from the practice menu/i }));
    expect(screen.getByRole("button", { name: /add metacognition & self-regulated learning to the practice menu/i })).toBeEnabled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("copies the selected public plan only after a user action", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<DevelopmentAtlas />);

    fireEvent.click(screen.getByRole("button", { name: /add stress, resilience & coping to the practice menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy practice menu/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("Orient to the present");
    expect(screen.getByRole("status")).toHaveTextContent(/practice menu copied/i);
  });

  it("provides a manual copy fallback and a clear action when clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<DevelopmentAtlas />);

    fireEvent.click(screen.getByRole("button", { name: /add nutrition, hydration & energy to the practice menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy practice menu/i }));

    await waitFor(() => expect(screen.getByRole("textbox", { name: /plan text to select and copy/i })).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent(/copy manually/i);

    const clearButton = screen.getByRole("button", { name: /clear menu/i });
    clearButton.focus();
    fireEvent.click(clearButton);
    expect(screen.getByText(/your menu is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear menu/i })).toBe(clearButton);
    expect(clearButton).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(/no selections were saved/i);
  });

  it("uses external source links with safe new-tab attributes and in-app links as real routes", () => {
    render(<DevelopmentAtlas />);

    const whoLink = screen.getByRole("link", { name: /read who's healthy-diet fact sheet/i });
    expect(whoLink).toHaveAttribute("href", "https://www.who.int/news-room/fact-sheets/detail/healthy-diet");
    expect(whoLink).toHaveAttribute("target", "_blank");
    expect(whoLink).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByRole("link", { name: /explore memory/i })).toHaveAttribute("href", "/explore/memory");
  });
});

describe("DevelopPage", () => {
  it("frames the atlas as broad educational exploration, not a clinical service", () => {
    render(<DevelopPage />);

    expect(screen.getByRole("heading", { level: 1, name: /explore what helps people learn, adapt, and grow/i })).toBeInTheDocument();
    expect(screen.getByText(/not medical advice, diagnosis, treatment/i)).toBeInTheDocument();
    expect(screen.getByText(/broad, not exhaustive or a validated curriculum/i)).toBeInTheDocument();
  });
});
