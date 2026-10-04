import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JourneysPage from "@/app/journeys/page";
import JourneyPage, { generateStaticParams } from "@/app/journeys/[slug]/page";
import { JOURNEYS } from "@/features/journeys/content";

describe("journey pages", () => {
  it("lists every path with its question, shape, and a single clear action", () => {
    render(<JourneysPage />);

    expect(screen.getByRole("heading", { level: 1, name: /a path, not a syllabus/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how a path is built/i })).toBeInTheDocument();
    for (const journey of JOURNEYS) {
      expect(screen.getByRole("heading", { name: journey.title })).toBeInTheDocument();
      expect(screen.getByText(journey.question)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link", { name: /open this path/i })).toHaveLength(JOURNEYS.length);
    expect(screen.getByText(/is not a course grade/i)).toBeInTheDocument();
    expect(screen.getByText(/educational only/i)).toBeInTheDocument();
  });

  it("renders an ordered, anchored, fully linked path with prev/next structure", async () => {
    const journey = JOURNEYS.find((entry) => entry.slug === "memory-first")!;
    const page = await JourneyPage({ params: Promise.resolve({ slug: journey.slug }) });
    render(page);

    const articleHeadings = journey.steps.map((step) => screen.getByRole("heading", { level: 2, name: step.title }));
    expect(articleHeadings).toHaveLength(journey.steps.length);

    for (const step of journey.steps) {
      const section = document.getElementById(`step-${step.id}`);
      expect(section, `missing anchored section for ${step.id}`).toBeTruthy();
      expect(within(section as HTMLElement).getByText(step.purpose)).toBeInTheDocument();
      expect(within(section as HTMLElement).getByText(step.takeaway)).toBeInTheDocument();
      expect(within(section as HTMLElement).getByText(step.caution)).toBeInTheDocument();
      expect(within(section as HTMLElement).getByRole("link", { name: step.linkLabel })).toHaveAttribute("href", step.href);
    }

    const rails = screen.getByRole("navigation", { name: /all \d+ steps/i });
    expect(within(rails).getAllByRole("link")).toHaveLength(journey.steps.length);
    expect(screen.getByText(/nothing records where you stopped/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /previous:/i }).length).toBe(journey.steps.length - 1);
    expect(screen.getByRole("link", { name: /path complete — choose another/i })).toHaveAttribute("href", "/journeys");
  });

  it("prerenders exactly the published paths and rejects an unknown slug", async () => {
    expect(generateStaticParams().map(({ slug }) => slug).sort()).toEqual(JOURNEYS.map((journey) => journey.slug).sort());
    await expect(JourneyPage({ params: Promise.resolve({ slug: "not-a-path" }) })).rejects.toThrow();
  });

  it("links the wider product from each path so the journey is not a silo", async () => {
    const journey = JOURNEYS[0];
    render(await JourneyPage({ params: Promise.resolve({ slug: journey.slug }) }));

    expect(screen.getByRole("region", { name: /still connected after the path/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /guided paths/i }).length).toBeGreaterThan(0);
  });
});
