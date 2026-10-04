import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const clientFiles = [
  "src/app/coach/page.tsx",
  "src/features/coach/coach-workspace.tsx",
  "src/features/coach/coach.module.css",
];

describe("coach privacy boundaries", () => {
  it("keeps API credentials and server environment access out of client files", () => {
    for (const file of clientFiles) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toContain("OPENAI_API_KEY");
      expect(source).not.toContain("process.env");
    }
  });

  it("does not persist or log reflection/chat data in the coach client", () => {
    const client = readFileSync(join(process.cwd(), "src/features/coach/coach-workspace.tsx"), "utf8");
    expect(client).not.toMatch(/localStorage|sessionStorage|console\.(log|info|debug)/);
    expect(client).toContain('fetch("/coach/api"');
    expect(client).toContain("selectedContextOption?.context ?? null");
  });
});
