"use client";

import { useEffect, useRef } from "react";
import { getLandMask, LAND_MASK_H, LAND_MASK_W } from "@/lib/land-mask";

// Brightness ramps, dark → light.
const LAND_RAMP = ".:-=+*#%@";
const OCEAN_RAMP = " ..::";

const TILT = 0.4; // radians the north pole leans toward the viewer
const SECONDS_PER_TURN = 48;
const FPS = 30;
// Light from the upper left, slightly in front (view space: x right, y up, z out).
const LIGHT = (() => {
  const v = [-0.55, 0.5, 0.67];
  const len = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / len);
})();

interface Cell {
  /** Index into the grid row string. */
  col: number;
  /** Mask row for this cell's latitude. */
  maskRow: number;
  /** Mask column at zero rotation (fractional). */
  baseU: number;
  /** Lit amount 0..1. */
  light: number;
}

interface Layout {
  cols: number;
  rows: number;
  charW: number;
  lineH: number;
  font: string;
  cells: Cell[][];
  /** Per row, columns of the faint atmosphere ring just outside the sphere. */
  halo: number[][];
}

function buildLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string
): Layout {
  const fontSize = width < 640 ? 9 : width < 1024 ? 10 : 11;
  const font = `${fontSize}px ${fontFamily}`;
  ctx.font = font;
  const charW = ctx.measureText("M").width || fontSize * 0.6;
  const lineH = Math.round(fontSize * 1.2);
  const cols = Math.ceil(width / charW);
  const rows = Math.ceil(height / lineH);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width * 0.46, height * 0.44);
  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);

  const cells: Cell[][] = [];
  const halo: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const rowCells: Cell[] = [];
    const rowHalo: number[] = [];
    const ny = -((r + 0.5) * lineH - cy) / radius;

    for (let c = 0; c < cols; c++) {
      const nx = ((c + 0.5) * charW - cx) / radius;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) {
        if (d2 < 1.06) rowHalo.push(c);
        continue;
      }
      const nz = Math.sqrt(1 - d2);

      // View → world: undo the tilt around the x axis.
      const wy = ny * cosT + nz * sinT;
      const wz = -ny * sinT + nz * cosT;
      const lat = Math.asin(Math.max(-1, Math.min(1, wy)));
      const lon = Math.atan2(nx, wz);

      const maskRow = Math.min(
        LAND_MASK_H - 1,
        Math.max(0, Math.floor(((Math.PI / 2 - lat) / Math.PI) * LAND_MASK_H))
      );
      const baseU = ((lon + Math.PI) / (2 * Math.PI)) * LAND_MASK_W;
      const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      // Soft limb darkening keeps the edge readable as a sphere.
      const light = Math.min(1, 0.12 + diffuse * 0.88) * (0.55 + 0.45 * nz);

      rowCells.push({ col: c, maskRow, baseU, light });
    }
    cells.push(rowCells);
    halo.push(rowHalo);
  }

  return { cols, rows, charW, lineH, font, cells, halo };
}

function draw(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  mask: Uint8Array,
  width: number,
  height: number,
  shift: number
) {
  ctx.clearRect(0, 0, width, height);
  ctx.font = layout.font;
  ctx.textBaseline = "top";

  const blank = " ".repeat(layout.cols);
  const land = blank.split("");
  const landLit = blank.split("");
  const ocean = blank.split("");

  for (let r = 0; r < layout.rows; r++) {
    const rowCells = layout.cells[r];
    const rowHalo = layout.halo[r];
    if (rowCells.length === 0 && rowHalo.length === 0) continue;

    for (const cell of rowCells) {
      let u = Math.floor(cell.baseU + shift) % LAND_MASK_W;
      if (u < 0) u += LAND_MASK_W;
      const isLand = mask[cell.maskRow * LAND_MASK_W + u] === 1;

      if (isLand) {
        const ch = LAND_RAMP[Math.min(LAND_RAMP.length - 1, Math.floor(cell.light * LAND_RAMP.length))];
        if (cell.light > 0.55) landLit[cell.col] = ch;
        else land[cell.col] = ch;
      } else {
        ocean[cell.col] =
          OCEAN_RAMP[Math.min(OCEAN_RAMP.length - 1, Math.floor(cell.light * OCEAN_RAMP.length))];
      }
    }
    for (const c of rowHalo) ocean[c] = "·";

    const y = r * layout.lineH;
    ctx.fillStyle = "rgba(163, 163, 163, 0.28)";
    ctx.fillText(ocean.join(""), 0, y);
    ctx.fillStyle = "rgba(212, 212, 212, 0.42)";
    ctx.fillText(land.join(""), 0, y);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(landLit.join(""), 0, y);

    // Reset only the cells we touched for the next row.
    for (const cell of rowCells) {
      land[cell.col] = " ";
      landLit[cell.col] = " ";
      ocean[cell.col] = " ";
    }
    for (const c of rowHalo) ocean[c] = " ";
  }
}

export default function AsciiGlobe({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const mask = getLandMask();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cssMono = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-mono")
      .trim();
    const fontFamily = `${cssMono ? `${cssMono}, ` : ""}ui-monospace, SFMono-Regular, Menlo, monospace`;

    let width = 0;
    let height = 0;
    let layout: Layout | null = null;
    // Start with 30°E (Africa / Europe) facing the viewer.
    let shift = LAND_MASK_W * (30 / 360);
    let raf = 0;
    let last = 0;
    let visible = true;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = buildLayout(ctx, width, height, fontFamily);
      draw(ctx, layout, mask, width, height, shift);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!layout || !visible) return;
      if (last === 0) last = now;
      const dt = now - last;
      if (dt < 1000 / FPS) return;
      last = now;
      // Earth spins west → east, so features drift left → right.
      shift -= (LAND_MASK_W / SECONDS_PER_TURN) * (Math.min(dt, 100) / 1000);
      draw(ctx, layout, mask, width, height, shift);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    // Re-measure once the web font is in, since glyph width may change.
    document.fonts?.ready.then(resize).catch(() => {});

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
    });
    io.observe(container);

    if (!reduceMotion) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
