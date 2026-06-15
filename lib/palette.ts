// The deterministic, parametric vocabulary the configurator draws from.
// None of this hits an AI model — it is all composited live in the browser.

export type StyleKey = "line" | "flat" | "pop" | "watercolour";
export type PatternKey = "solid" | "dots" | "lines" | "grid" | "halo";
export type FontKey = "minimal" | "classic" | "script" | "bold";

export const STYLES: { key: StyleKey; label: string; vector: boolean; note: string }[] = [
  { key: "line", label: "Line", vector: true, note: "Single-weight line drawing" },
  { key: "flat", label: "Flat", vector: true, note: "Bold flat colour shapes" },
  { key: "pop", label: "Pop", vector: true, note: "Duotone colour blocks" },
  { key: "watercolour", label: "Watercolour", vector: false, note: "Soft painterly (raster)" },
];

export const PATTERNS: { key: PatternKey; label: string }[] = [
  { key: "solid", label: "Solid" },
  { key: "dots", label: "Dots" },
  { key: "lines", label: "Lines" },
  { key: "grid", label: "Grid" },
  { key: "halo", label: "Halo" },
];

export const COLOURS: { key: string; label: string; hex: string }[] = [
  { key: "bone", label: "Bone", hex: "#FAF7F2" },
  { key: "charcoal", label: "Charcoal", hex: "#2E2E2E" },
  { key: "sage", label: "Sage", hex: "#A6B89B" },
  { key: "blush", label: "Blush", hex: "#E8C8C0" },
  { key: "navy", label: "Navy", hex: "#2B3A55" },
  { key: "mustard", label: "Mustard", hex: "#D8A33B" },
  { key: "terracotta", label: "Terracotta", hex: "#C57B57" },
  { key: "dustyblue", label: "Dusty blue", hex: "#8FA9C0" },
];

export const FONTS: { key: FontKey; label: string; className: string }[] = [
  { key: "minimal", label: "Minimal", className: "font-name-minimal" },
  { key: "classic", label: "Classic", className: "font-name-classic" },
  { key: "script", label: "Script", className: "font-name-script" },
  { key: "bold", label: "Bold", className: "font-name-bold" },
];

// --- Deterministic colour helpers (the "auto-contrast" rules) -------------

export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.5;
}

function mix(hex: string, target: string, amount: number): string {
  const a = hex.replace("#", "");
  const b = target.replace("#", "");
  const out = [0, 2, 4].map((i) => {
    const x = parseInt(a.slice(i, i + 2), 16);
    const y = parseInt(b.slice(i, i + 2), 16);
    return Math.round(x + (y - x) * amount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${out.join("")}`;
}

// Pattern tint: nudge the background toward its contrast so the pattern reads
// without the user ever having to choose a second colour.
export function patternTint(bg: string): string {
  return isDark(bg) ? mix(bg, "#ffffff", 0.16) : mix(bg, "#000000", 0.1);
}

// Ink the pet is drawn in — light on dark backgrounds, dark on light ones.
export function petInk(bg: string): { dark: string; mid: string; light: string } {
  return isDark(bg)
    ? { dark: "#FAF7F2", mid: "#D8CFC4", light: "#B7A99A" }
    : { dark: "#2E2E2E", mid: "#6E6359", light: "#A89B8C" };
}

// Name text: readable against any background.
export function nameColour(bg: string): string {
  return isDark(bg) ? "#FAF7F2" : "#2E2E2E";
}
