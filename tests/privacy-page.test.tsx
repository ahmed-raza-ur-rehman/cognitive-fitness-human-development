import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage from "@/app/privacy/page";

describe("privacy and data-practices page", () => {
  it("summarizes local storage, sharing, provider disclosure, and prototype limits", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("main", { name: /your choices, and what this prototype handles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /optional progress saved in this browser/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /temporary choices in the development atlas/i })).toBeInTheDocument();
    expect(screen.getByText(/selected pathways and the generated practice menu stay in page memory only/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /friend-challenge links are shareable data/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /optional ai guide: separate provider sharing/i })).toBeInTheDocument();
    expect(screen.getByText(/not zero data retention/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy contact and a formal access\/deletion-request process have not been designated yet/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /guided paths, search, and my practice/i })).toBeInTheDocument();
    expect(screen.getByText(/your words are not sent to a server, logged, or stored/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /why there is no google sign-in/i })).toBeInTheDocument();
    expect(screen.getByText(/separate from authorization to use that person's gemini or api quota/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /optional puter guide/i })).toBeInTheDocument();
    expect(screen.getByText(/third-party script from puter.com executes on the page/i)).toBeInTheDocument();
    expect(screen.getByText(/free monthly allowance with paid usage beyond it/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Train" })).toHaveAttribute("href", "/train");
  });
});
