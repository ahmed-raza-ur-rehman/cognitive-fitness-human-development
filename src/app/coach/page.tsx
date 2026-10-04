import type { Metadata } from "next";
import { CoachWorkspace } from "@/features/coach/coach-workspace";
import { isOpenAICoachAvailable } from "@/lib/ai/openai-provider";
import { isPuterEnabled } from "@/lib/ai/puter";

export const metadata: Metadata = {
  title: "Optional guide",
  description: "An optional, privacy-conscious guide to reviewed concepts, practice activities, evidence, and goals. Works fully without AI.",
};

export default function CoachPage() {
  // Embed only two booleans in the statically rendered shell. The OpenAI path rechecks server
  // configuration before every request; the Puter path is a browser-side option that never
  // touches a key held by this deployment.
  return (
    <CoachWorkspace
      providerAvailable={isOpenAICoachAvailable()}
      puterEnabled={isPuterEnabled()}
    />
  );
}
