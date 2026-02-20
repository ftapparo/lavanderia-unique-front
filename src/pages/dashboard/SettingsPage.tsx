import { useEffect, useMemo, useState } from "react";
import { Check, Monitor, Moon, PaintBucket, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Slider,
} from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";
type ToneId = "soft" | "default" | "deep";

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
  ring: string;
};

const STORAGE_THEME_MODE = "template-theme";
const STORAGE_THEME_BASE = "template-theme-base";
const STORAGE_THEME_TONE = "template-theme-tone";
const STORAGE_THEME_RADIUS = "template-theme-radius";

const THEME_MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

const TONES: ToneConfig[] = [
  { id: "soft", label: "Suave", lightness: 0.56, darkLightness: 0.47, chromaScale: 0.78, highlightLightness: 0.83 },
  { id: "default", label: "Padrao", lightness: 0.49, darkLightness: 0.41, chromaScale: 1, highlightLightness: 0.78 },
  { id: "deep", label: "Profundo", lightness: 0.44, darkLightness: 0.36, chromaScale: 1.12, highlightLightness: 0.73 },
];

const BASE_COLORS: BaseThemeColor[] = [
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

function createPalette(base: BaseThemeColor, tone: ToneConfig): GeneratedPalette {
  const primary = formatOklch(tone.lightness, base.chroma * tone.chromaScale, base.hue);
  const primaryDark = formatOklch(tone.darkLightness, base.chroma * tone.chromaScale * 0.88, base.hue);
  const highlight = formatOklch(tone.highlightLightness, base.chroma * 0.62, base.hue - 16);
  const secondary = formatOklch(tone.lightness - 0.03, base.chroma * tone.chromaScale * 0.72, base.hue + 10);
  const accent = formatOklch(0.92, Math.max(0.02, base.chroma * 0.24), base.hue - 8);
  const ring = formatOklch(Math.min(0.68, tone.lightness + 0.13), base.chroma * tone.chromaScale * 0.7, base.hue);

  return {
    label: `${base.label} ${tone.label}`,
    primary,
    primaryDark,
    highlight,
    secondary,
    accent,
    ring,
  };
}

function applyPalette(palette: GeneratedPalette) {
  const root = document.documentElement.style;
  root.setProperty("--color-brand-primary", palette.primary);
  root.setProperty("--color-brand-primary-dark", palette.primaryDark);
  root.setProperty("--color-brand-highlight", palette.highlight);
  root.setProperty("--color-primary", palette.primary);
  root.setProperty("--color-primary-dark", palette.primaryDark);
  root.setProperty("--color-secondary", palette.secondary);
  root.setProperty("--color-accent", palette.accent);
  root.setProperty("--color-ring", palette.ring);
}

function applyRadius(radiusRem: number) {
  document.documentElement.style.setProperty("--radius", `${radiusRem}rem`);
}

function mapLegacyPalette(legacyPaletteId: string | null): { baseId: string; toneId: ToneId } | null {
  if (!legacyPaletteId) return null;
  if (legacyPaletteId === "soft-blue") return { baseId: "blue", toneId: "soft" };
  if (legacyPaletteId === "default-blue") return { baseId: "blue", toneId: "default" };
  if (legacyPaletteId === "deep-blue") return { baseId: "blue", toneId: "deep" };
  return null;
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [baseId, setBaseId] = useState<string>("blue");
  const [toneId, setToneId] = useState<ToneId>("default");
  const [radiusRem, setRadiusRem] = useState(0.5);

  useEffect(() => {
    setMounted(true);

    const legacy = mapLegacyPalette(localStorage.getItem("template-theme-palette"));
    const savedBaseId = localStorage.getItem(STORAGE_THEME_BASE) ?? legacy?.baseId ?? "blue";
    const savedToneId = (localStorage.getItem(STORAGE_THEME_TONE) as ToneId | null) ?? legacy?.toneId ?? "default";
    const savedRadius = Number(localStorage.getItem(STORAGE_THEME_RADIUS) ?? "0.5");

    const safeBase = BASE_COLORS.find((color) => color.id === savedBaseId) ?? BASE_COLORS[0];
    const safeTone = TONES.find((tone) => tone.id === savedToneId) ?? TONES[1];
    const safeRadius = Number.isFinite(savedRadius) ? Math.min(0.75, Math.max(0.375, savedRadius)) : 0.5;

    setBaseId(safeBase.id);
    setToneId(safeTone.id);
    setRadiusRem(safeRadius);

    applyPalette(createPalette(safeBase, safeTone));
    applyRadius(safeRadius);
  }, []);

  const selectedBase = useMemo(() => BASE_COLORS.find((color) => color.id === baseId) ?? BASE_COLORS[0], [baseId]);
  const selectedTone = useMemo(() => TONES.find((tone) => tone.id === toneId) ?? TONES[1], [toneId]);
  const selectedPalette = useMemo(() => createPalette(selectedBase, selectedTone), [selectedBase, selectedTone]);

  const activeTheme = mounted && (theme === "light" || theme === "dark" || theme === "system") ? theme : "system";

  const handleThemeChange = (next: ThemeMode) => {
    setTheme(next);
    localStorage.setItem(STORAGE_THEME_MODE, next);
  };

  const handleToneChange = (nextToneId: ToneId) => {
    const nextTone = TONES.find((tone) => tone.id === nextToneId);
    if (!nextTone) return;

    setToneId(nextTone.id);
    const nextPalette = createPalette(selectedBase, nextTone);
    applyPalette(nextPalette);
    localStorage.setItem(STORAGE_THEME_TONE, nextTone.id);
  };

  const handleBaseChange = (nextBaseId: string) => {
    const nextBase = BASE_COLORS.find((color) => color.id === nextBaseId);
    if (!nextBase) return;

    setBaseId(nextBase.id);
    const nextPalette = createPalette(nextBase, selectedTone);
    applyPalette(nextPalette);
    localStorage.setItem(STORAGE_THEME_BASE, nextBase.id);
  };

  const handleRadiusChange = (values: number[]) => {
    const nextRadius = values[0] ?? 0.5;
    setRadiusRem(nextRadius);
    applyRadius(nextRadius);
    localStorage.setItem(STORAGE_THEME_RADIUS, String(nextRadius));
  };

  const handleReset = () => {
    const fallbackBase = BASE_COLORS[0];
    const fallbackTone = TONES[1];

    setTheme("system");
    setBaseId(fallbackBase.id);
    setToneId(fallbackTone.id);
    setRadiusRem(0.5);

    applyPalette(createPalette(fallbackBase, fallbackTone));
    applyRadius(0.5);

    localStorage.removeItem(STORAGE_THEME_MODE);
    localStorage.removeItem(STORAGE_THEME_BASE);
    localStorage.removeItem(STORAGE_THEME_TONE);
    localStorage.removeItem(STORAGE_THEME_RADIUS);
    localStorage.removeItem("template-theme-palette");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Configuracoes de Tema"
        description="Controle central de aparencia do template: modo, intensidade e temas-base de cor."
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Aparencia Global</CardTitle>
            <CardDescription>As escolhas abaixo afetam todo o template e ficam salvas no navegador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="typo-label">Modo do tema</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_MODES.map((option) => {
                  const Icon = option.icon;
                  const active = activeTheme === option.id;
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => handleThemeChange(option.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                      {active ? <Check className="h-4 w-4" /> : null}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="typo-label">Intensidade da paleta</Label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tone) => {
                  const active = tone.id === toneId;
                  return (
                    <Button
                      key={tone.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      onClick={() => handleToneChange(tone.id)}
                      className="min-w-24"
                    >
                      {tone.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="typo-label">Cor base do tema</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {BASE_COLORS.map((baseColor) => {
                  const previewPalette = createPalette(baseColor, selectedTone);
                  const selected = baseColor.id === baseId;

                  return (
                    <button
                      key={baseColor.id}
                      type="button"
                      onClick={() => handleBaseChange(baseColor.id)}
                      className={cn(
                        "rounded-md border p-3 text-left transition-colors",
                        selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="typo-label text-foreground">{baseColor.label}</p>
                        {selected ? <Check className="h-4 w-4 text-primary" /> : null}
                      </div>
                      <div className="flex gap-2">
                        <span className="h-4 w-8 rounded-sm" style={{ background: previewPalette.primary }} />
                        <span className="h-4 w-8 rounded-sm" style={{ background: previewPalette.secondary }} />
                        <span className="h-4 w-8 rounded-sm" style={{ background: previewPalette.highlight }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="typo-label">Raio base dos componentes ({radiusRem.toFixed(3)}rem)</Label>
              <Slider
                value={[radiusRem]}
                onValueChange={handleRadiusChange}
                min={0.375}
                max={0.75}
                step={0.025}
                className="max-w-[360px]"
              />
            </div>

            <div>
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <PaintBucket className="h-4 w-4" />
                Restaurar padrao
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview do Tema</CardTitle>
            <CardDescription>Checagem rapida de contraste, estados e hierarquia visual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-card p-3">
              <p className="typo-label text-muted-foreground">Estado atual</p>
              <p className="typo-body">
                Modo resolvido: <span className="font-semibold text-primary">{resolvedTheme === "dark" ? "Escuro" : "Claro"}</span>
              </p>
              <p className="typo-body">
                Tema ativo: <span className="font-semibold text-primary">{selectedPalette.label}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border p-3" style={{ background: selectedPalette.primary }}>
                <p className="typo-label text-white">Primaria</p>
              </div>
              <div className="rounded-md border p-3" style={{ background: selectedPalette.secondary }}>
                <p className="typo-label text-white">Secundaria</p>
              </div>
              <div className="rounded-md border p-3" style={{ background: selectedPalette.highlight }}>
                <p className="typo-label text-[var(--color-highlight-foreground)]">Highlight</p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <p className="typo-label text-muted-foreground">Superficie</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border state-info-soft p-3">
                <p className="typo-label">Info Soft</p>
                <p className="typo-caption">Estado semantico de informacao.</p>
              </div>
              <div className="rounded-md border state-success-soft p-3">
                <p className="typo-label">Success Soft</p>
                <p className="typo-caption">Estado semantico de sucesso.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
