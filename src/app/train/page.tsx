import type { Metadata } from "next";
import Link from "next/link";
import { TrainingHub } from "@/features/training/training-hub";
import { getRouteById, ROUTE_KIND_LABELS } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Train",
  description:
    "Play short cognitive-skill practice activities, choose a user-led practice goal, and optionally compare a fixed daily challenge with a friend.",
};

const trainOutlook = ["progress", "evidence", "develop", "coach"]
  .map((id) => getRouteById(id as "progress"))
  .filter((route): route is NonNullable<typeof route> => Boolean(route));

export default function TrainPage() {
  return (
    <>
      <TrainingHub />
      <section className="after-train" aria-labelledby="after-train-title">
        <div className="container after-train-inner">
          <div>
            <p className="section-kicker">Practice ends at the practice</p>
            <h2 id="after-train-title">What the saved sessions can and cannot say.</h2>
            <p>
              A session count is only a count: item sets and conditions are not controlled, so nothing here shows that a
              general ability changed. Where you want to look next depends on which question you actually have.
            </p>
          </div>
          <ul>
            {trainOutlook.map((route) => (
              <li key={route.id}>
                <Link href={route.path}>
                  <span className="mini-label">{ROUTE_KIND_LABELS[route.kind]}</span>
                  <strong>{route.label}</strong>
                  <span>{route.purpose}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
