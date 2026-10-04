import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "../src/app/loading";

describe("loading state", () => {
  it("announces progress without depending on an external service", () => {
    render(<Loading />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("heading", { name: "Preparing the learning space…" }),
    ).toBeInTheDocument();
  });
});
