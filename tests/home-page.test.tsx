import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../src/app/page";

describe("HomePage", () => {
  it("offers one calm entry point and explains the shape of the space", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /understand how you think/i }),
    ).toBeInTheDocument();

    // A single primary action rather than several competing ones.
    expect(screen.getByRole("link", { name: /start a guided path/i })).toHaveAttribute("href", "/journeys");
    expect(screen.getByRole("link", { name: /browse the concepts/i })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: /search for a word/i })).toHaveAttribute("href", "/search");

    expect(screen.getByRole("list", { name: "How this space behaves" })).toHaveTextContent(/no diagnosis, ever/i);
    expect(screen.getByRole("note")).toHaveTextContent(/take your time/i);
  });

  it("routes each stated intent to the area built for it", () => {
    render(<HomePage />);

    expect(screen.getByRole("region", { name: /what brought you here today/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /i want to understand something/i })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: /i want to practise a task/i })).toHaveAttribute("href", "/train#activities");
    expect(screen.getByRole("link", { name: /i want to be shown the way/i })).toHaveAttribute("href", "/journeys");
    expect(screen.getByRole("link", { name: /i want the bigger picture/i })).toHaveAttribute("href", "/develop");
  });

  it("names every area with a single job and links to each of them", () => {
    render(<HomePage />);

    const map = screen.getByRole("list", { name: "Eight areas of the product" });
    expect(map).toBeInTheDocument();
    for (const href of ["/explore", "/journeys", "/lab", "/evidence", "/train", "/progress", "/develop", "/coach"]) {
      expect(screen.getAllByRole("link").some((link) => link.getAttribute("href") === href)).toBe(true);
    }
    expect(screen.getByText(/no hidden hierarchy/i)).toBeInTheDocument();
  });

  it("surfaces the guided paths and the wider atlas from real content", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /start from what you actually wondered about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /why do i forget things\?/i })).toHaveAttribute("href", "/journeys/memory-first");
    expect(screen.getByRole("heading", { name: /four doorways into a much wider map/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /think & learn/i })).toHaveAttribute("href", "/develop#think-learn");
  });

  it("keeps the honest-result example and the conceptual map labelled as such", () => {
    render(<HomePage />);

    expect(screen.getByRole("img", { name: /a small map of memory concepts/i })).toBeInTheDocument();
    expect(screen.getByText(/not a brain scan or anatomical diagram/i)).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /example of transparent activity feedback/i }))
      .toHaveTextContent(/no percentile, brain age, or diagnosis/i);
    expect(screen.getByText(/your mind is not a score/i)).toBeInTheDocument();
  });
});
