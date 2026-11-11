"use client";

import { useEffect, useRef } from "react";

// "PTSC" in the ANSI Shadow figlet style.
const LOGO = [
  "██████╗ ████████╗███████╗ ██████╗",
  "██╔══██╗╚══██╔══╝██╔════╝██╔════╝",
  "██████╔╝   ██║   ███████╗██║     ",
  "██╔═══╝    ██║   ╚════██║██║     ",
  "██║        ██║   ███████║╚██████╗",
  "╚═╝        ╚═╝   ╚══════╝ ╚═════╝",
].join("\n");

const WIDTH = LOGO.indexOf("\n");
const GLYPHS = "#$%&@*+=<>/\\{}[]01;:";
const SWEEP_MS = 900; // left edge → right edge
const JITTER_MS = 450;
const FRAME_MS = 45;

/**
 * Club logo in ASCII that decodes from random glyphs once, on load. Renders
 * the finished logo on the server, so it never shows garbage without
 * JavaScript.
 */
export default function ScrambleLogo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = LOGO.split("");
    const revealAt = chars.map((c, i) => {
      if (c === " " || c === "\n") return 0;
      const col = i % (WIDTH + 1);
      return (col / WIDTH) * SWEEP_MS + Math.random() * JITTER_MS;
    });
    const start = performance.now();
    let lastFrame = 0;
    let raf = 0;

    const frame = (now: number) => {
      if (now - lastFrame < FRAME_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
      const t = now - start;
      let done = true;
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        if (t >= revealAt[i]) {
          out += chars[i];
        } else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (!done) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      // Never leave half-decoded glyphs behind if unmounted mid-animation.
      el.textContent = LOGO;
    };
  }, []);

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      // System monospace fonts here all draw the box/block glyphs at the same
      // width; Geist Mono would fall back per glyph and break the alignment.
      style={{
        fontFamily: "Consolas, ui-monospace, SFMono-Regular, Menlo, 'Liberation Mono', monospace",
        fontSize: "clamp(9px, 3.4vw, 24px)",
      }}
      className={`leading-[1.05] bg-linear-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent select-none ${className}`}
    >
      {LOGO}
    </pre>
  );
}
