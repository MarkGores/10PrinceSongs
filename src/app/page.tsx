"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas-pro";

const PLACEHOLDER_SONGS = [
  "Purple Rain",
  "When Doves Cry",
  "Little Red Corvette",
  "Adore",
  "Let's Go Crazy",
  "Kiss",
  "Sometimes It Snows In April",
  "1999",
  "Let's Pretend We're Married",
  "I Would Die 4 U",
];

export default function Home() {
  const [songs, setSongs] = useState<string[]>(Array(10).fill(""));
  const [userName, setUserName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const graphicRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [previewScale, setPreviewScale] = useState(0.5);

  const filledCount = songs.filter((s) => s.trim()).length;

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        setPreviewScale(containerWidth / 1080);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleSongChange = useCallback(
    (index: number, value: string) => {
      const newSongs = [...songs];
      newSongs[index] = value;
      setSongs(newSongs);
      setGenerated(false);
    },
    [songs]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Enter" && index < 9) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
      if (
        e.key === "Backspace" &&
        songs[index] === "" &&
        index > 0
      ) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    },
    [songs]
  );

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setIsGenerating(true);

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      const canvas = await html2canvas(graphicRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080,
      });

      const link = document.createElement("a");
      link.download = "My10PrinceSongs.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setGenerated(true);
    } catch {
      alert("Something went wrong generating your image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6fb]">
      {/* Header */}
      <header className="w-full bg-white border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#5B2D8E]"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              #My10PrinceSongs
            </h1>
            <p className="text-sm text-[#7B4FAF] mt-0.5">
              10-Year Anniversary &middot; April 21, 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PurpleRainIcon />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Intro */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[#5B2D8E] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            What are your Top 10 Prince songs? Enter them below, download your
            graphic, and share it with{" "}
            <span className="font-semibold">#My10PrinceSongs</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
          {/* Input Panel */}
          <div className="w-full lg:w-[380px] order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-4">
                Your Top 10
              </h2>

              <div className="space-y-2">
                {songs.map((song, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#5B2D8E] w-6 text-right tabular-nums">
                      {i + 1}.
                    </span>
                    <input
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      value={song}
                      onChange={(e) => handleSongChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      placeholder={PLACEHOLDER_SONGS[i]}
                      className="flex-1 px-3 py-2 text-sm border border-purple-100 rounded-lg focus:border-[#5B2D8E] focus:ring-1 focus:ring-[#5B2D8E]/20 bg-white text-[#3D1A5E] placeholder:text-purple-200"
                      maxLength={60}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-purple-50">
                <label className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider block mb-2">
                  Your Name / Handle{" "}
                  <span className="text-purple-300 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setGenerated(false);
                  }}
                  placeholder="@yourhandle"
                  className="w-full px-3 py-2 text-sm border border-purple-100 rounded-lg focus:border-[#5B2D8E] focus:ring-1 focus:ring-[#5B2D8E]/20 bg-white text-[#3D1A5E] placeholder:text-purple-200"
                  maxLength={40}
                />
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#7B4FAF] mb-1.5">
                  <span>{filledCount}/10 songs</span>
                  {filledCount === 10 && (
                    <span className="text-[#5B2D8E] font-semibold">
                      Ready!
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-purple-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B2D8E] to-[#7B4FAF] rounded-full"
                    style={{
                      width: `${(filledCount / 10) * 100}%`,
                      transition: "width 300ms ease",
                    }}
                  />
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={filledCount === 0 || isGenerating}
                className={`mt-5 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  filledCount === 0
                    ? "bg-purple-100 text-purple-300 cursor-not-allowed"
                    : isGenerating
                      ? "bg-[#5B2D8E] text-white opacity-70 cursor-wait"
                      : generated
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-[#5B2D8E] text-white hover:bg-[#3D1A5E] shadow-lg hover:shadow-xl pulse-purple"
                }`}
              >
                {isGenerating
                  ? "Generating..."
                  : generated
                    ? "Downloaded! Click to download again"
                    : "Download PNG"}
              </button>

              {filledCount > 0 && filledCount < 10 && (
                <p className="text-xs text-center text-[#7B4FAF] mt-2">
                  You can download with any number of songs
                </p>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="w-full lg:flex-1 lg:min-w-0 order-1 lg:order-2 flex flex-col items-center overflow-hidden">
            <h2 className="text-sm font-semibold text-[#5B2D8E] uppercase tracking-wider mb-3">
              Live Preview
            </h2>

            {/* Preview container - responsive sizing */}
            <div
              ref={previewContainerRef}
              className="w-full max-w-[540px] relative rounded-2xl shadow-lg overflow-hidden border border-purple-100"
              style={{ aspectRatio: "1/1" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "1080px",
                  height: "1080px",
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <GraphicTemplate
                  songs={songs}
                  userName={userName}
                  ref={graphicRef}
                />
              </div>
            </div>

            <p className="text-xs text-[#7B4FAF] mt-3 text-center">
              The downloaded image will be 1080&times;1080px — perfect for
              Instagram
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center border-t border-purple-50 bg-white">
        <p className="text-sm text-[#7B4FAF]">
          Celebrating the legacy of Prince &middot;{" "}
          <span className="font-semibold">#My10PrinceSongs</span>
        </p>
        <p className="text-xs text-purple-300 mt-1">
          Created by{" "}
          <a
            href="https://instagram.com/djdudleyd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#5B2D8E]"
          >
            @djdudleyd
          </a>{" "}
          &middot; Purple Highs
        </p>
      </footer>
    </div>
  );
}

/* =====================================================
   THE GRAPHIC TEMPLATE (1080x1080)
   This is what gets rendered to PNG
   ===================================================== */
import { forwardRef } from "react";

const GraphicTemplate = forwardRef<
  HTMLDivElement,
  { songs: string[]; userName: string }
>(function GraphicTemplate({ songs, userName }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        padding: "72px 80px 60px",
        boxSizing: "border-box",
        position: "relative",
        fontFamily: "var(--font-inter), 'Inter', sans-serif",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            fontSize: "72px",
            fontWeight: 900,
            fontStyle: "italic",
            color: "#5B2D8E",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          #My10PrinceSongs
        </h1>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: "100%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #C4A4DE 20%, #7B4FAF 50%, #C4A4DE 80%, transparent)",
          marginBottom: "40px",
        }}
      />

      {/* Song list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "6px",
          paddingLeft: "40px",
        }}
      >
        {songs.map((song, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              minHeight: "54px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "#5B2D8E",
                width: "48px",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {i + 1}.
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontSize: "32px",
                fontWeight: 400,
                color: song.trim() ? "#5B2D8E" : "#D8CCE5",
                letterSpacing: "-0.01em",
              }}
            >
              {song.trim() || PLACEHOLDER_SONGS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "32px",
        }}
      >
        {/* User name */}
        <div>
          {userName.trim() && (
            <p
              style={{
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontSize: "26px",
                fontWeight: 500,
                color: "#5B2D8E",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {userName}
            </p>
          )}
        </div>

        {/* Purple Highs Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid #5B2D8E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Outer decorative ring */}
            <div
              style={{
                position: "absolute",
                width: "116px",
                height: "116px",
                borderRadius: "50%",
                border: "2px solid #C4A4DE",
                top: "-11px",
                left: "-11px",
              }}
            />
            <div
              style={{
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  fontSize: "20px",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#5B2D8E",
                  display: "block",
                }}
              >
                Purple
              </span>
              <span
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  fontSize: "20px",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#C4A84D",
                  display: "block",
                }}
              >
                Highs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* Simple decorative icon for the header */
function PurpleRainIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="18" r="17" stroke="#5B2D8E" strokeWidth="2" />
      <circle cx="18" cy="18" r="12" stroke="#C4A4DE" strokeWidth="1.5" />
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fill="#5B2D8E"
        fontSize="14"
        fontFamily="var(--font-playfair), Playfair Display, serif"
        fontWeight="bold"
        fontStyle="italic"
      >
        P
      </text>
    </svg>
  );
}
