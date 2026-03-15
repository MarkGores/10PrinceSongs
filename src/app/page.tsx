"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import PRINCE_SONGS from "@/data/princeSongs";

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
  const [glowing, setGlowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cardScale, setCardScale] = useState(1);

  const filledCount = songs.filter((s) => s.trim()).length;

  // Scale the 1080×1080 card to fit the viewport
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const vw = containerRef.current.offsetWidth;
        const maxCardDisplay = Math.min(vw - 32, 580);
        setCardScale(maxCardDisplay / 1080);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (focusedIndex === null) return [];
    const query = songs[focusedIndex]?.trim().toLowerCase();
    if (!query || query.length < 1) return [];

    // Filter out songs already chosen in other slots
    const alreadyChosen = new Set(
      songs
        .filter((s, i) => i !== focusedIndex && s.trim())
        .map((s) => s.trim().toLowerCase())
    );

    const matches = PRINCE_SONGS.filter((s) => {
      const lower = s.toLowerCase();
      if (alreadyChosen.has(lower)) return false;
      // Exact match means no need for suggestions
      if (lower === query) return false;
      return lower.includes(query);
    });

    // Sort: starts-with matches first, then contains
    matches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(query) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(query) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.localeCompare(b);
    });

    return matches.slice(0, 4);
  }, [focusedIndex, songs]);

  // Reset highlighted suggestion when suggestions change
  useEffect(() => {
    setHighlightedSuggestion(-1);
  }, [suggestions]);

  const handleSongChange = useCallback(
    (index: number, value: string) => {
      const newSongs = [...songs];
      newSongs[index] = value;
      setSongs(newSongs);
      setGenerated(false);
    },
    [songs]
  );

  const selectSuggestion = useCallback(
    (index: number, songTitle: string) => {
      const newSongs = [...songs];
      newSongs[index] = songTitle;
      setSongs(newSongs);
      setGenerated(false);
      // Advance to next input
      if (index < 9) {
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
      } else {
        inputRefs.current[index]?.blur();
      }
    },
    [songs]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      // If suggestions are open, handle arrow keys and enter
      if (suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedSuggestion((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedSuggestion((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          return;
        }
        if (e.key === "Enter" && highlightedSuggestion >= 0) {
          e.preventDefault();
          selectSuggestion(index, suggestions[highlightedSuggestion]);
          return;
        }
        if (e.key === "Tab" && suggestions.length > 0) {
          // Tab accepts the first/highlighted suggestion
          e.preventDefault();
          const pick =
            highlightedSuggestion >= 0
              ? suggestions[highlightedSuggestion]
              : suggestions[0];
          selectSuggestion(index, pick);
          return;
        }
        if (e.key === "Escape") {
          setFocusedIndex(null);
          return;
        }
      }

      if (e.key === "Enter" && index < 9) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
      if (e.key === "Backspace" && songs[index] === "" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    },
    [songs, suggestions, highlightedSuggestion, selectSuggestion]
  );

  // Generate the image blob from current state
  const generateImage = useCallback(async (): Promise<Blob> => {
    await document.fonts.ready;

    const S = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // --- White background ---
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, S, S);

    // --- Title ---
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#5B2D8E";
    ctx.font = 'italic 900 72px "Playfair Display", serif';
    ctx.fillText("#My10PrinceSongs", S / 2, 108);

    // --- Divider line (gradient) ---
    const grad = ctx.createLinearGradient(80, 0, S - 80, 0);
    grad.addColorStop(0, "rgba(196, 164, 222, 0)");
    grad.addColorStop(0.2, "#C4A4DE");
    grad.addColorStop(0.5, "#7B4FAF");
    grad.addColorStop(0.8, "#C4A4DE");
    grad.addColorStop(1, "rgba(196, 164, 222, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(80, 134, S - 160, 2);

    // --- Song list ---
    const listTop = 190;
    const listBottom = S - 150;
    const rowHeight = (listBottom - listTop) / 10;

    ctx.textBaseline = "middle";

    for (let i = 0; i < 10; i++) {
      const y = listTop + rowHeight * i + rowHeight / 2;
      const songText = songs[i]?.trim() || "";

      ctx.textAlign = "right";
      ctx.fillStyle = "#5B2D8E";
      ctx.font = '400 28px "Inter", sans-serif';
      ctx.fillText(`${i + 1}.`, 152, y);

      ctx.textAlign = "left";
      ctx.fillStyle = songText ? "#5B2D8E" : "#D8CCE5";
      ctx.font = '400 32px "Inter", sans-serif';
      ctx.fillText(songText || PLACEHOLDER_SONGS[i], 176, y);
    }

    // --- User name (bottom left) ---
    if (userName.trim()) {
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#5B2D8E";
      ctx.font = '500 26px "Inter", sans-serif';
      ctx.fillText(userName, 80, S - 52);
    }

    // --- Purple Highs logo (bottom right) ---
    const logoX = S - 138;
    const logoY = S - 110;

    ctx.beginPath();
    ctx.arc(logoX, logoY, 58, 0, Math.PI * 2);
    ctx.strokeStyle = "#C4A4DE";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(logoX, logoY, 50, 0, Math.PI * 2);
    ctx.strokeStyle = "#5B2D8E";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#5B2D8E";
    ctx.font = 'italic 700 20px "Playfair Display", serif';
    ctx.fillText("Purple", logoX, logoY - 10);
    ctx.fillStyle = "#C4A84D";
    ctx.font = 'italic 700 20px "Playfair Display", serif';
    ctx.fillText("Highs", logoX, logoY + 14);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      }, "image/png");
    });
  }, [songs, userName]);

  // Check if native share (with files) is supported
  const canShare = typeof navigator !== "undefined" &&
    !!navigator.share &&
    !!navigator.canShare;

  // Primary action: Share on mobile, Copy on desktop
  const handlePrimaryAction = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();

      if (canShare) {
        // Mobile: use native share sheet
        const file = new File([blob], "My10PrinceSongs.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "#My10PrinceSongs",
            text: "My Top 10 Prince Songs #My10PrinceSongs",
          });
          setGlowing(true);
          setTimeout(() => setGlowing(false), 800);
          setGenerated(true);
          setIsGenerating(false);
          return;
        }
      }

      // Desktop: copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setGlowing(true);
        setTimeout(() => setGlowing(false), 800);
        setGenerated(true);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsGenerating(false);
      } catch {
        // Clipboard API not supported — fall back to download
        downloadBlob(blob);
      }
    } catch (err) {
      // User cancelled the share sheet — not an error
      if (err instanceof Error && err.name === "AbortError") {
        setIsGenerating(false);
        return;
      }
      alert("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  // Secondary action: plain download
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      downloadBlob(blob);
    } catch {
      alert("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "My10PrinceSongs.png";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setGlowing(true);
    setTimeout(() => setGlowing(false), 800);
    setGenerated(true);
    setIsGenerating(false);
  };

  return (
    <div className="bg-atmosphere min-h-screen min-h-dvh flex flex-col items-center">
      {/* Top tagline */}
      <div className="animate-fade-in pt-8 sm:pt-12 pb-2 text-center px-4">
        <p className="text-purple-muted/70 text-sm tracking-[0.2em] uppercase">
          10-Year Anniversary &middot; April 21, 2026
        </p>
      </div>

      {/* Prompt */}
      <div className="animate-fade-up-delay text-center px-6 pb-6 sm:pb-8 max-w-md">
        <p className="text-purple-muted/90 text-base leading-relaxed">
          Tap any line. Type your picks. Download &amp; share.
        </p>
      </div>

      {/* The Card — this IS the interface */}
      <div
        ref={containerRef}
        className="w-full flex justify-center px-4"
      >
        <div
          style={{
            width: 1080 * cardScale,
            height: 1080 * cardScale,
          }}
        >
          <div
            ref={cardRef}
            className={`graphic-card ${glowing ? "glow-pulse" : ""}`}
            style={{
              width: 1080,
              height: 1080,
              transform: `scale(${cardScale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                padding: "72px 80px 52px",
                boxSizing: "border-box",
              }}
            >
              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <h1
                  style={{
                    fontFamily:
                      "var(--font-playfair), 'Playfair Display', serif",
                    fontSize: 72,
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

              {/* Divider */}
              <div
                style={{
                  width: "100%",
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #C4A4DE 20%, #7B4FAF 50%, #C4A4DE 80%, transparent)",
                  marginBottom: 36,
                }}
              />

              {/* Song list — each row is an input with autocomplete */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                  paddingLeft: 32,
                }}
              >
                {songs.map((song, i) => (
                  <div
                    key={i}
                    className="song-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      height: 68,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter), 'Inter', sans-serif",
                        fontSize: 28,
                        fontWeight: 400,
                        color: "#5B2D8E",
                        width: 48,
                        textAlign: "right",
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                    >
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        value={song}
                        onChange={(e) => handleSongChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={() => {
                          // Cancel any pending blur timeout from a previous input
                          if (blurTimeoutRef.current) {
                            clearTimeout(blurTimeoutRef.current);
                            blurTimeoutRef.current = null;
                          }
                          setFocusedIndex(i);
                        }}
                        onBlur={() => {
                          // Delay to allow suggestion click to register,
                          // but store the timeout so it can be cancelled if
                          // focus moves to another song input
                          blurTimeoutRef.current = setTimeout(() => {
                            setFocusedIndex(null);
                            blurTimeoutRef.current = null;
                          }, 150);
                        }}
                        placeholder={PLACEHOLDER_SONGS[i]}
                        className="song-input"
                        style={{ fontSize: 32 }}
                        maxLength={50}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />

                      {/* Autocomplete dropdown */}
                      {focusedIndex === i && suggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="suggestions-dropdown"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: -8,
                            right: -8,
                            zIndex: 50,
                            marginTop: 4,
                            background: "#ffffff",
                            borderRadius: 8,
                            boxShadow:
                              "0 8px 30px rgba(91, 45, 142, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(91, 45, 142, 0.12)",
                            overflow: "hidden",
                          }}
                        >
                          {suggestions.map((s, si) => (
                            <button
                              key={s}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                selectSuggestion(i, s);
                              }}
                              onMouseEnter={() =>
                                setHighlightedSuggestion(si)
                              }
                              style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "12px 16px",
                                fontSize: 26,
                                fontFamily:
                                  "var(--font-inter), 'Inter', sans-serif",
                                color: "#5B2D8E",
                                background:
                                  si === highlightedSuggestion
                                    ? "rgba(91, 45, 142, 0.06)"
                                    : "transparent",
                                border: "none",
                                cursor: "pointer",
                                borderBottom:
                                  si < suggestions.length - 1
                                    ? "1px solid rgba(91, 45, 142, 0.06)"
                                    : "none",
                                transition: "background 0.1s ease",
                              }}
                            >
                              <SuggestionText
                                text={s}
                                query={songs[i]?.trim() || ""}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row: name + logo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 24,
                }}
              >
                <div style={{ flex: 1, maxWidth: 400 }}>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setGenerated(false);
                    }}
                    placeholder="your name or @handle"
                    className="name-input"
                    style={{ fontSize: 26 }}
                    maxLength={40}
                    autoComplete="off"
                  />
                </div>

                {/* Purple Highs Logo */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      border: "3px solid #5B2D8E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 116,
                        height: 116,
                        borderRadius: "50%",
                        border: "2px solid #C4A4DE",
                        top: -11,
                        left: -11,
                      }}
                    />
                    <div style={{ textAlign: "center", lineHeight: 1.1 }}>
                      <span
                        style={{
                          fontFamily:
                            "var(--font-playfair), 'Playfair Display', serif",
                          fontSize: 20,
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
                          fontFamily:
                            "var(--font-playfair), 'Playfair Display', serif",
                          fontSize: 20,
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
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="w-full max-w-md px-6 pt-6 sm:pt-8 pb-4 animate-fade-up-delay flex flex-col items-center gap-3">
        {/* Primary button: Share (mobile) or Copy Image (desktop) */}
        <button
          onClick={handlePrimaryAction}
          disabled={filledCount === 0 || isGenerating}
          className={`btn-download w-full py-4 px-6 rounded-2xl text-base tracking-wide ${
            generated ? "btn-success" : ""
          }`}
        >
          {isGenerating
            ? "Creating your image..."
            : copied
              ? "✓ Copied to clipboard!"
              : generated
                ? canShare
                  ? "Share again"
                  : "✓ Copied! Share again"
                : filledCount === 0
                  ? "Enter your songs above"
                  : canShare
                    ? "Share Your Top 10"
                    : "Copy Image"}
        </button>

        {/* Secondary: Download link */}
        {filledCount > 0 && (
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="text-purple-muted/50 text-sm hover:text-purple-muted/80 transition-colors underline underline-offset-2 cursor-pointer bg-transparent border-none"
          >
            or download as PNG
          </button>
        )}

        {generated && (
          <p className="text-purple-muted/80 text-sm text-center animate-fade-in">
            Post it with{" "}
            <span
              className="text-purple-muted font-semibold cursor-pointer hover:text-white transition-colors"
              onClick={() => {
                navigator.clipboard.writeText("#My10PrinceSongs");
              }}
              title="Click to copy"
            >
              #My10PrinceSongs
            </span>{" "}
            <span className="text-purple-muted/50">(tap to copy)</span>
          </p>
        )}

        {!generated && filledCount > 0 && filledCount < 10 && (
          <p className="text-purple-muted/50 text-xs text-center">
            {filledCount}/10 &mdash; you can share anytime
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 pb-6 text-center">
        <p className="text-purple-muted/30 text-xs">
          Created by{" "}
          <a
            href="https://instagram.com/djdudleyd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-muted/60 transition-colors"
          >
            @djdudleyd
          </a>{" "}
          &middot; Purple Highs
        </p>
      </div>
    </div>
  );
}

/* Highlights the matching portion of a suggestion */
function SuggestionText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span style={{ fontWeight: 600 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
