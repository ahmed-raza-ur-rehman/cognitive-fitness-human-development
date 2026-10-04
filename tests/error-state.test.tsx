import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RouteError from "../src/app/error";

describe("route error state", () => {
  it("offers a retry and a safe route back without showing the thrown message", () => {
    const reset = vi.fn();
    render(
      <RouteError
        error={Object.assign(new Error("private internal detail"), { digest: "ref-123" })}
        reset={reset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "This page didn’t load as expected." }),
    ).toBeInTheDocument();
    expect(screen.getByText("ref-123")).toBeInTheDocument();
    expect(screen.queryByText("private internal detail")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to home" })).toHaveAttribute(
      "href",
      "/",
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
