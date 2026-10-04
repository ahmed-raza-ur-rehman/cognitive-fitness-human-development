import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "../src/components/site-header";

describe("SiteHeader", () => {
  it("exposes labeled primary navigation with real destinations", () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    for (const [label, href] of [
      ["Explore", "/explore"],
      ["Develop", "/develop"],
      ["Train", "/train"],
      ["Lab", "/lab"],
      ["Evidence", "/evidence"],
      ["Coach", "/coach"],
    ]) {
      expect(within(navigation).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
  });

  it("offers search and a starting point instead of a decorative status line", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /find a page by word/i })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /not sure where to start\? begin with a path/i })).toHaveAttribute("href", "/journeys");
    expect(screen.queryByText(/open learning space/i)).not.toBeInTheDocument();
  });

  it("explains each section while the compact menu is open and closes on selection", () => {
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "What each section is for" })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute("aria-expanded", "true");
    const notes = screen.getByRole("navigation", { name: "What each section is for" });
    expect(within(notes).getByText(/read one reviewed concept/i)).toBeInTheDocument();
    expect(within(notes).getByText(/practise a defined task/i)).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: "Explore" }));

    expect(screen.queryByRole("navigation", { name: "What each section is for" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute("aria-expanded", "false");
  });
});
