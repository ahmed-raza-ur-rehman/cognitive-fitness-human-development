import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container state-page" aria-labelledby="state-title">
      <section className="state-card">
        <p className="section-kicker">Page not found</p>
        <h1 id="state-title">This path isn’t part of the map.</h1>
        <p className="state-description">
          The address may have changed. Head back to the learning space to
          continue exploring.
        </p>
        <div className="state-actions">
          <Link className="button button-primary" href="/">
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
