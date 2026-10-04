"use client";

import Link from "next/link";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <main id="main-content" className="container state-page" aria-labelledby="state-title">
      <section className="state-card">
        <p className="section-kicker">A temporary pause</p>
        <h1 id="state-title">This page didn’t load as expected.</h1>
        <p className="state-description">
          The learning space is still here. You can try this page again or return
          to the beginning.
        </p>
        {error.digest ? (
          <p className="state-reference">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}
        <div className="state-actions">
          <button className="button button-primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button button-quiet" href="/">
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
