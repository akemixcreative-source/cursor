"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root fallback when the root layout fails. Must define html/body (no root layout).
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Something went wrong
        </h1>
        <p style={{ opacity: 0.65, maxWidth: "36ch", marginTop: "0.75rem" }}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "#ffffff",
            color: "#000000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
