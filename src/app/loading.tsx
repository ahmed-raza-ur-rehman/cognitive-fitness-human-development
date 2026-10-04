export default function Loading() {
  return (
    <main
      id="main-content"
      className="container state-page"
      aria-labelledby="loading-title"
      aria-busy="true"
    >
      <section className="state-card">
        <p className="section-kicker" role="status" aria-live="polite">
          Loading
        </p>
        <h1 id="loading-title">Preparing the learning space…</h1>
        <p className="state-description">
          The core learning content does not depend on an account or an AI
          service.
        </p>
      </section>
    </main>
  );
}
