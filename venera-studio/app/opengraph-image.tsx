import { ImageResponse } from "next/og";

export const alt = "Venera — New York motion design studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "80px 88px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#f5f0e8",
            fontSize: 104,
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Venera
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            color: "#e85d04",
            fontSize: 32,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Motion Design Studio
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            color: "rgba(245, 240, 232, 0.55)",
            fontSize: 26,
          }}
        >
          New York · Launch films · Product motion · Brand systems
        </div>
      </div>
    ),
    { ...size },
  );
}
