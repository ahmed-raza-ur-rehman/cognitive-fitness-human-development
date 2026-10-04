"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const pageStyle = {
  display: "grid",
  minHeight: "100vh",
  placeItems: "center",
  background: "#0b1016",
  color: "#edf3f1",
  fontFamily: "system-ui, sans-serif",
  padding: "24px",
} as const;

const cardStyle = {
  width: "min(100%, 680px)",
  border: "1px solid rgba(204, 222, 226, 0.2)",
  borderRadius: "24px",
  padding: "clamp(24px, 6vw, 48px)",
  background: "#141c25",
} as const;

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={pageStyle}>
        <main style={cardStyle} aria-labelledby="global-error-title">
          <p style={{ color: "#b9ead5", letterSpacing: "0.12em", fontSize: "0.75rem" }}>
            A temporary pause
          </p>
          <h1 id="global-error-title" style={{ lineHeight: 1.15 }}>
            The learning space couldn’t open this page.
          </h1>
          <p style={{ color: "#c6d0cf", lineHeight: 1.7 }}>
            You can try again, or return to the beginning. No account or saved
            activity is needed to continue.
          </p>
          <button
            onClick={reset}
            style={{
              minHeight: "44px",
              marginTop: "12px",
              border: "1px solid #b9ead5",
              borderRadius: "999px",
              padding: "10px 18px",
              background: "#b9ead5",
              color: "#0b1016",
              cursor: "pointer",
              font: "inherit",
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
