import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EvidencePage from "../src/app/evidence/page";
import ExplorePage from "../src/app/explore/page";
import ConceptPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "../src/app/explore/[slug]/page";
import LabPage from "../src/app/lab/page";

describe("learning journey pages", () => {
  it("lists all reviewed concepts with direct links", () => {
    render(<ExplorePage />);

    expect(screen.getByRole("heading", { level: 1, name: /start with a question/i }))
      .toBeInTheDocument();
    for (const slug of ["memory", "working-memory", "attention", "learning", "retrieval-practice", "sleep"]) {
      expect(
        screen.getAllByRole("link").some((link) => link.getAttribute("href") === `/explore/${slug}`),
      ).toBe(true);
    }
  });

  it("renders a graph-backed memory page with connected concepts, evidence, and its optional activity", async () => {
    const page = await ConceptPage({ params: Promise.resolve({ slug: "memory" }) });
    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "Memory" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /working memory/i }))
      .toHaveAttribute("href", "/explore/working-memory");
    expect(screen.getByRole("link", { name: /retrieval practice/i }))
      .toHaveAttribute("href", "/explore/retrieval-practice");
    expect(screen.getByRole("link", { name: /sleep and recovery/i }))
      .toHaveAttribute("href", "/explore/sleep");
    expect(screen.getByRole("link", { name: /read the instructions/i }))
      .toHaveAttribute("href", "/lab");
    expect(screen.getByRole("heading", { name: "What the sources support" })).toBeInTheDocument();
    expect(screen.getByText(/not a diagnosis or a measure of your overall ability/i))
      .toBeInTheDocument();
  });

  it("renders the sleep and recovery pathway with an optional planner and careful health boundaries", async () => {
    const page = await ConceptPage({ params: Promise.resolve({ slug: "sleep" }) });
    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "Sleep and recovery" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sketch a sleep-opportunity window" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the statement/i }))
      .toHaveAttribute("href", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/");
    expect(screen.getByRole("link", { name: /return to memory/i }))
      .toHaveAttribute("href", "/explore/memory");
    expect(screen.getByRole("link", { name: /explore learning evidence/i }))
      .toHaveAttribute("href", "/explore/learning");
    expect(screen.getByRole("link", { name: /review an optional, separate practice goal/i }))
      .toHaveAttribute("href", "/train#goals");
    expect(screen.getByRole("status")).toHaveTextContent(/nothing is estimated until you do/i);
    expect(screen.getByRole("heading", { name: "A population-level sleep-duration recommendation" }))
      .toBeInTheDocument();
    expect(screen.getByText(/schedule tool or one sleep change will improve everyday learning/i))
      .toBeInTheDocument();
  });

  it("prebuilds known concept routes and derives page metadata from the graph", async () => {
    expect(dynamicParams).toBe(false);
    const staticParams = generateStaticParams().map(({ slug }) => slug).sort();
    expect(staticParams).toEqual([
      "attention",
      "learning",
      "memory",
      "retrieval-practice",
      "sleep",
      "working-memory",
    ]);
    await expect(generateMetadata({ params: Promise.resolve({ slug: "memory" }) }))
      .resolves.toMatchObject({ title: "Memory" });
    await expect(generateMetadata({ params: Promise.resolve({ slug: "sleep" }) }))
      .resolves.toMatchObject({ title: "Sleep and recovery" });
  });

  it("frames the activity before participation and links back to reviewed context", () => {
    render(<LabPage />);

    expect(screen.getByRole("heading", { level: 1, name: /one short recall demonstration/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What will happen" })).toBeInTheDocument();
    expect(screen.getByText(/not sent to a server or AI/i)).toBeInTheDocument();
    expect(screen.getByText(/no account, microphone, or audio is needed/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what research says about retrieval practice/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse all sources and limitations/i }))
      .toHaveAttribute("href", "/evidence#retrieval-evidence");
  });

  it("shows the activity’s non-measures separately from research claims", () => {
    render(<EvidencePage />);

    expect(screen.getByRole("heading", { level: 1, name: /research with the context included/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "This activity is not a validated assessment." }))
      .toBeInTheDocument();
    expect(screen.getByText("working-memory capacity")).toBeInTheDocument();
    expect(screen.getByText(/does not test or validate this activity/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Source, population, and limitations")[0]);
    expect(screen.getAllByRole("link", { name: /DOI:/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/What this evidence does not establish/).length).toBeGreaterThan(0);
  });
});
