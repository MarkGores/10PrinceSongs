import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "#My10PrinceSongs - Share Your Top 10 Prince Songs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: "4px",
            color: "rgba(196, 168, 77, 0.7)",
            marginBottom: 24,
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
          CELEBRATING PRINCE · APRIL 21, 2026
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#C4A84D",
            marginBottom: 16,
          }}
        >
          #My10PrinceSongs
        </div>
        <div
          style={{
            fontSize: 28,
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: 48,
          }}
        >
          Everyone&apos;s got their 10. What are yours?
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {["Purple Rain", "When Doves Cry", "Kiss", "Let's Go Crazy", "1999"].map(
            (song, i) => (
              <div
                key={i}
                style={{
                  fontSize: 22,
                  color: "rgba(255, 255, 255, 0.3)",
                  fontFamily: "sans-serif",
                  fontWeight: 300,
                }}
              >
                {i + 1}. {song}
              </div>
            )
          )}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.25)",
              fontFamily: "sans-serif",
            }}
          >
            ...
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 40,
            fontSize: 14,
            color: "rgba(196, 168, 77, 0.4)",
            fontFamily: "sans-serif",
          }}
        >
          Purple Highs
        </div>
      </div>
    ),
    { ...size }
  );
}
