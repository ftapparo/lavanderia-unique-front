export type ToneId = "soft" | "default" | "deep";

type BaseThemeColor = {
  id: string;
  label: string;
  hue: number;
  chroma: number;
};

type ToneConfig = {
  id: ToneId;
  label: string;
  lightness: number;
  darkLightness: number;
  chromaScale: number;
  highlightLightness: number;
};

type GeneratedPalette = {
  label: string;
  primary: string;
  primaryDark: string;
  highlight: string;
  secondary: string;
  accent: string;
  accentDark: string;
  accentForeground: string;
  accentForegroundDark: string;
  ring: string;
};

export const STORAGE_THEME_BASE = "template-theme-base";
export const STORAGE_THEME_TONE = "template-theme-tone";
export const STORAGE_THEME_RADIUS = "template-theme-radius";

export const TONES: ToneConfig[] = [
  { id: "soft", label: "Suave", lightness: 0.56, darkLightness: 0.47, chromaScale: 0.78, highlightLightness: 0.83 },
  { id: "default", label: "Padrao", lightness: 0.49, darkLightness: 0.41, chromaScale: 1, highlightLightness: 0.78 },
  { id: "deep", label: "Profundo", lightness: 0.44, darkLightness: 0.36, chromaScale: 1.12, highlightLightness: 0.73 },
];

export const BASE_COLORS: BaseThemeColor[] = [
  { id: "blue", label: "Azul", hue: 255, chroma: 0.16 },
  { id: "cyan", label: "Ciano", hue: 220, chroma: 0.13 },
  { id: "teal", label: "Turquesa", hue: 185, chroma: 0.12 },
  { id: "green", label: "Verde", hue: 155, chroma: 0.14 },
  { id: "lime", label: "Lima", hue: 130, chroma: 0.13 },
  { id: "yellow", label: "Amarelo", hue: 95, chroma: 0.14 },
  { id: "orange", label: "Laranja", hue: 55, chroma: 0.16 },
  { id: "red", label: "Vermelho", hue: 28, chroma: 0.18 },
  { id: "pink", label: "Rosa", hue: 350, chroma: 0.16 },
  { id: "purple", label: "Roxo", hue: 300, chroma: 0.16 },
  { id: "graphite", label: "Grafite", hue: 255, chroma: 0.02 },
];

function formatOklch(lightness: number, chroma: number, hue: number) {
  const l = Math.max(0, Math.min(1, lightness));
  const c = Math.max(0, chroma);
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hue.toFixed(1)})`;
}

export function createPalette(base: BaseThemeColor, tone: ToneConfig): GeneratedPalette {
  const primary = formatOklch(tone.lightness, base.chroma * tone.chromaScale, base.hue);
  const primaryDark = formatOklch(tone.darkLightness, base.chroma * tone.chromaScale * 0.88, base.hue);
  const highlight = formatOklch(tone.highlightLightness, base.chroma * 0.62, base.hue - 16);
  const secondary = formatOklch(tone.lightness - 0.03, base.chroma * tone.chromaScale * 0.72, base.hue + 10);
  const accentChroma = Math.max(0.02, base.chroma * 0.24);
  const accent = formatOklch(0.92, accentChroma, base.hue - 8);
  const accentDark = formatOklch(0.30, accentChroma * 0.6, base.hue - 8);
  const accentForeground = formatOklch(0.29, base.chroma * 0.56, base.hue - 8);
  const accentForegroundDark = formatOklch(0.96, 0.008, 260);
  const ring = formatOklch(Math.min(0.68, tone.lightness + 0.13), base.chroma * tone.chromaScale * 0.7, base.hue);

  return {
    label: `${base.label} ${tone.label}`,
    primary,
    primaryDark,
    highlight,
    secondary,
    accent,
    accentDark,
    accentForeground,
    accentForegroundDark,
    ring,
  };
}

export function applyPalette(palette: GeneratedPalette) {
  // Remove inline styles de accent para não sobrescrever o .dark via inline specificity
  const root = document.documentElement.style;
  root.removeProperty("--color-accent");
  root.removeProperty("--color-accent-foreground");

  const STYLE_ID = "theme-palette";
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root {
  --color-brand-primary: ${palette.primary};
  --color-brand-primary-dark: ${palette.primaryDark};
  --color-brand-highlight: ${palette.highlight};
  --color-primary: ${palette.primary};
  --color-primary-dark: ${palette.primaryDark};
  --color-secondary: ${palette.secondary};
  --color-accent: ${palette.accent};
  --color-accent-foreground: ${palette.accentForeground};
  --color-ring: ${palette.ring};
}
.dark {
  --color-accent: ${palette.accentDark};
  --color-accent-foreground: ${palette.accentForegroundDark};
}`;
}

export function applyRadius(radiusRem: number) {
  document.documentElement.style.setProperty("--radius", `${radiusRem}rem`);
}

export function mapLegacyPalette(legacyPaletteId: string | null): { baseId: string; toneId: ToneId } | null {
  if (!legacyPaletteId) return null;
  if (legacyPaletteId === "soft-blue") return { baseId: "blue", toneId: "soft" };
  if (legacyPaletteId === "default-blue") return { baseId: "blue", toneId: "default" };
  if (legacyPaletteId === "deep-blue") return { baseId: "blue", toneId: "deep" };
  return null;
}

export function restoreThemeFromStorage() {
  const legacy = mapLegacyPalette(localStorage.getItem("template-theme-palette"));
  const savedBaseId = localStorage.getItem(STORAGE_THEME_BASE) ?? legacy?.baseId ?? "blue";
  const savedToneId = (localStorage.getItem(STORAGE_THEME_TONE) as ToneId | null) ?? legacy?.toneId ?? "default";
  const savedRadius = Number(localStorage.getItem(STORAGE_THEME_RADIUS) ?? "0.5");

  const safeBase = BASE_COLORS.find((color) => color.id === savedBaseId) ?? BASE_COLORS[0];
  const safeTone = TONES.find((tone) => tone.id === savedToneId) ?? TONES[1];
  const safeRadius = Number.isFinite(savedRadius) ? Math.min(0.75, Math.max(0.375, savedRadius)) : 0.5;

  applyPalette(createPalette(safeBase, safeTone));
  applyRadius(safeRadius);
}
