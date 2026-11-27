/**
 * @file gen-theme-tokens.cjs
 * @description Generates `client/src/theme.css` - the role-aware color tokens shared by the light
 * and dark palettes.
 *
 * Every color the dashboard uses is declared here as a CSS custom property holding space-separated
 * sRGB channels (for example `--c-t-gray-100: 243 244 246`), so Tailwind's `<alpha-value>`
 * placeholder can still compose opacity modifiers such as `bg-surface-2/60`.
 *
 * The light palette is derived, not hand-picked:
 * - neutral foregrounds mirror the ramp, so `text-gray-100` stays the most prominent text;
 * - chromatic foregrounds mirror the ramp and then darken until they clear 4.5:1 against white;
 * - chromatic surfaces keep their hue but deepen the pale steps so they stay visible on white.
 *
 * Usage: `node scripts/gen-theme-tokens.cjs` (run from the repository root).
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const colors = require(path.join(ROOT, "client/node_modules/tailwindcss/colors.js"));

const chan = (h) => {
  const v = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)).join(" ");
};
const lum = (h) => {
  const v = h.replace("#", "");
  const c = [0, 2, 4]
    .map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const SH = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

const rows = [];
const add = (n, d, l) => rows.push([n, d, l]);

/* ---------- neutral foreground ramp: light mode mirrors the ramp so relative emphasis is preserved ---------- */
const NEUTRAL_TEXT = {
  gray: {
    50: "#020617",
    100: "#0f172a",
    200: "#1f2937",
    300: "#374151",
    400: "#4b5563",
    500: "#6b7280",
    600: "#9ca3af",
    700: "#cbd5e1",
  },
  slate: { 300: "#334155", 400: "#475569" },
};
for (const [fam, map] of Object.entries(NEUTRAL_TEXT))
  for (const [sh, light] of Object.entries(map)) add(`t-${fam}-${sh}`, colors[fam][sh], light);

/* ---------- chromatic foreground: mirror the ramp, then darken until it clears 4.5:1 on white ---------- */
const HUE_TEXT = {
  amber: [100, 200, 300, 400, 500],
  blue: [200, 300, 400],
  cyan: [200, 300, 400],
  emerald: [100, 200, 300, 400, 500],
  fuchsia: [300],
  green: [200, 400],
  indigo: [200, 300, 400],
  orange: [300],
  pink: [300],
  red: [100, 200, 300, 400],
  rose: [200, 300, 400, 500],
  sky: [300, 400],
  teal: [200, 300],
  violet: [200, 300, 400],
  yellow: [200, 300, 400],
};
for (const [fam, shades] of Object.entries(HUE_TEXT)) {
  for (const sh of shades) {
    const src = colors[fam][sh];
    const cand =
      SH[
        Math.max(
          0,
          Math.min(SH.length - 1, SH.indexOf("800") - (SH.indexOf(String(sh)) - SH.indexOf("100")))
        )
      ];
    let i = SH.indexOf(cand);
    while (contrast(colors[fam][SH[i]], "#ffffff") < 4.5 && i < SH.length - 1) i++;
    add(`t-${fam}-${sh}`, src, colors[fam][SH[i]]);
  }
}

/* ---------- neutral surface ramp (background role) ---------- */
const BG_NEUTRAL = {
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#d1d5db",
  800: "#e2e8f0",
  900: "#e2e8f0",
};
for (const [sh, light] of Object.entries(BG_NEUTRAL)) add(`b-gray-${sh}`, colors.gray[sh], light);
add("b-slate-400", colors.slate[400], "#64748b");
add("b-slate-500", colors.slate[500], "#64748b");

/* ---------- neutral border ramp ---------- */
const BD_NEUTRAL = { 500: "#64748b", 600: "#64748b", 700: "#cbd5e1", 800: "#e2e8f0" };
for (const [sh, light] of Object.entries(BD_NEUTRAL)) add(`bd-gray-${sh}`, colors.gray[sh], light);
add("bd-slate-500", colors.slate[500], "#64748b");

/* ---------- chromatic surfaces: keep the hue, deepen the pale steps for contrast on white ---------- */
const HUE_BG = {
  amber: [400, 500],
  blue: [400, 500],
  cyan: [400, 500],
  emerald: [400, 500],
  fuchsia: [500],
  green: [500],
  indigo: [400, 500],
  orange: [400, 500],
  pink: [400, 500],
  red: [400, 500, 600, 950],
  rose: [500],
  sky: [500],
  teal: [500],
  violet: [400, 500, 600],
  yellow: [400, 500],
};
const BG_SHIFT = { 400: "500", 500: "600", 600: "600", 950: "100" };
for (const [fam, shades] of Object.entries(HUE_BG))
  for (const sh of shades) add(`b-${fam}-${sh}`, colors[fam][sh], colors[fam][BG_SHIFT[sh]]);

/* ---------- placeholder / fill / decoration ---------- */
add("ph-gray-500", colors.gray[500], "#9ca3af");
add("ph-gray-600", colors.gray[600], "#b6bcc6");
add("fl-gray-100", colors.gray[100], "#1f2937");
add("fl-gray-300", colors.gray[300], "#334155");
add("fl-gray-600", colors.gray[600], "#475569");
add("de-amber-300", colors.amber[300], "#b45309");
add("de-violet-300", colors.violet[300], "#6d28d9");
add("de-violet-400", colors.violet[400], "#7c3aed");

/* ---------- ring ramp ---------- */
for (const [fam, sh] of [
  ["blue", 400],
  ["teal", 400],
  ["amber", 400],
  ["violet", 400],
  ["indigo", 500],
  ["sky", 500],
  ["emerald", 500],
  ["cyan", 500],
  ["pink", 500],
  ["rose", 500],
  ["orange", 500],
  ["fuchsia", 500],
  ["slate", 400],
  ["slate", 500],
])
  add(`r-${fam}-${sh}`, colors[fam][sh], colors[fam][sh === 400 ? 600 : 600]);

/* ---------- app tokens ---------- */
const APP = [
  ["b-surface-0", "#06060a", "#f1f5f9"],
  ["b-surface-1", "#0c0c14", "#ffffff"],
  ["b-surface-2", "#13131e", "#ffffff"],
  ["b-surface-3", "#1a1a28", "#ffffff"],
  ["b-surface-4", "#222233", "#eef2f7"],
  ["b-surface-5", "#2a2a3d", "#e2e8f0"],
  ["bd-surface-1", "#0c0c14", "#e2e8f0"],
  ["bd-surface-3", "#1a1a28", "#e2e8f0"],
  ["bd-surface-4", "#222233", "#cbd5e1"],
  ["dv-surface-4", "#222233", "#cbd5e1"],
  ["b-border", "#2a2a3d", "#e2e8f0"],
  ["bd-border", "#2a2a3d", "#e2e8f0"],
  ["dv-border", "#2a2a3d", "#e2e8f0"],
  ["bd-border-light", "#363650", "#cbd5e1"],
  ["bd-border-strong", "#3d3d5c", "#cbd5e1"],
  ["t-accent", "#6366f1", "#4f46e5"],
  ["b-accent", "#6366f1", "#4f46e5"],
  ["bd-accent", "#6366f1", "#4f46e5"],
  ["r-accent", "#6366f1", "#4f46e5"],
  ["g-accent", "#6366f1", "#4f46e5"],
  ["b-accent-hover", "#818cf8", "#6366f1"],
  ["t-accent-hover", "#818cf8", "#4338ca"],
  ["b-accent-muted", "#6366f1", "#4f46e5"],
  ["b-overlay", "#0f172a", "#0f172a"],
  ["t-fg-strong", "#ffffff", "#0f172a"],
  ["b-tint", "#ffffff", "#0f172a"],
  ["b-code-panel", "#08080c", "#f1f5f9"],
  ["b-code-header", "#050506", "#e2e8f0"],
  ["b-code-row", "#060609", "#f8fafc"],
  ["b-code-pre", "#0f0f19", "#f1f5f9"],
  ["b-code-inline", "#090910", "#f1f5f9"],
  ["brand-slack", "#e01e5a", "#c81e51"],
  ["brand-discord", "#5865f2", "#4c56d8"],
  ["brand-teams", "#6264a7", "#56589a"],
  ["brand-google-chat", "#1a73e8", "#135fbf"],
  ["brand-mattermost", "#0058cc", "#0050b3"],
  ["brand-rocketchat", "#f5455c", "#d63048"],
  ["brand-telegram", "#26a5e4", "#0e8fb8"],
  ["brand-pagerduty", "#06ac38", "#0a8f2f"],
  ["brand-opsgenie", "#2684ff", "#1a6fd4"],
  ["brand-splunk-oncall", "#f99d1c", "#c67c0a"],
];
for (const [n, d, l] of APP) add(n, d, l);

/* ---------- chart / splash tokens ---------- */
const CHART = {
  canvas: ["#12121f", "#ffffff"],
  panel: ["#1e1e2e", "#f8fafc"],
  empty: ["#161625", "#f1f5f9"],
  grid: ["#2a2a4a", "#e2e8f0"],
  line: ["#2a2a3d", "#e5e7eb"],
  border: ["#363650", "#cbd5e1"],
  track: ["#303044", "#eef2f7"],
  "track-border": ["#30304d", "#cbd5e1"],
  node: ["#1a1a28", "#ffffff"],
  "node-stroke": ["#1f1f30", "#cbd5e1"],
  text: ["#e2e8f0", "#1f2937"],
  "text-strong": ["#e4e4ed", "#1f2937"],
  "text-2": ["#cbd5e1", "#334155"],
  "text-2b": ["#d1d5db", "#334155"],
  "text-3": ["#94a3b8", "#64748b"],
  "text-3b": ["#9ca3af", "#64748b"],
  "text-4": ["#374151", "#94a3b8"],
  axis: ["#64748b", "#64748b"],
  muted: ["#6b7280", "#6b7280"],
  "ok-bg": ["#052e16", "#dcfce7"],
  "ok-stroke": ["#16a34a", "#16a34a"],
  "ok-text": ["#4ade80", "#166534"],
  "err-bg": ["#1f0808", "#fee2e2"],
  "err-stroke": ["#dc2626", "#dc2626"],
  "err-text": ["#f87171", "#b91c1c"],
  "err-deep": ["#7f1d1d", "#991b1b"],
  "warn-bg": ["#1c1a04", "#fefce8"],
  "warn-stroke": ["#ca8a04", "#ca8a04"],
  "warn-text": ["#facc15", "#a16207"],
  "grad-indigo": ["#312e81", "#e0e7ff"],
  "grad-indigo-2": ["#4338ca", "#c7d2fe"],
  "grad-indigo-3": ["#4f46e5", "#4f46e5"],
  "grad-violet-2": ["#3730a3", "#c7d2fe"],
  "grad-blue": ["#1e3a5f", "#dbeafe"],
  "grad-blue-2": ["#1d4ed8", "#bfdbfe"],
  "grad-green": ["#166534", "#bbf7d0"],
  "grad-teal": ["#134e4a", "#ccfbf1"],
  "grad-violet": ["#1e1b4b", "#e0e7ff"],
  "grad-emerald": ["#065f46", "#a7f3d0"],
  "grad-pale": ["#e0e7ff", "#eef2ff"],
  "grad-teal-2": ["#0f766e", "#5eead4"],
  "splash-bg": ["#06060a", "#ffffff"],
  "splash-bg2": ["#07070d", "#f8fafc"],
  "splash-bg3": ["#05050a", "#eef2f7"],
  "splash-deep": ["#24234b", "#eef2ff"],
  "splash-panel": ["#1f1f35", "#ffffff"],
  "splash-panel2": ["#141421", "#f8fafc"],
  "cat-1": ["#5b5b86", "#c7d2fe"],
  "cat-2": ["#43436a", "#a5b4fc"],
  "cat-3": ["#343352", "#818cf8"],
  "t-fuchsia": ["#e9d5ff", "#6d28d9"],
  "t-blue": ["#bfdbfe", "#1d4ed8"],
  "t-emerald": ["#a7f3d0", "#047857"],
  "t-teal": ["#5eead4", "#0f766e"],
  "t-violet": ["#c4b5fd", "#6d28d9"],
  "t-violet-2": ["#a78bfa", "#6d28d9"],
  "t-blue-2": ["#93c5fd", "#1d4ed8"],
  "t-green": ["#86efac", "#16a34a"],
  "t-indigo": ["#a5b4fc", "#4338ca"],
  "t-indigo-2": ["#c7d2fe", "#4f46e5"],
  "t-indigo-3": ["#e5e7ff", "#312e81"],
  "t-indigo-4": ["#7375b9", "#4338ca"],
  "t-indigo-5": ["#7477f7", "#4f46e5"],
  "t-indigo-6": ["#ececff", "#312e81"],
  "t-indigo-7": ["#e3e4ff", "#312e81"],
  "t-amber": ["#fbbf24", "#b45309"],
  "t-amber-2": ["#f59e0b", "#b45309"],
  "t-amber-3": ["#f5cd72", "#92400e"],
  "t-amber-4": ["#f5d991", "#a16207"],
  "t-amber-deep": ["#b4690f", "#92400e"],
  "t-cyan": ["#22d3ee", "#0e7490"],
  "t-emerald-2": ["#34d399", "#047857"],
  "t-blue-3": ["#60a5fa", "#1d4ed8"],
  "t-gold": ["#f7c948", "#a16207"],
  "t-gold-2": ["#f5be50", "#92400e"],
  "t-mint": ["#a8e2c4", "#047857"],
  "t-mint-2": ["#bae6d1", "#065f46"],
  "t-red-pale": ["#fecaca", "#b91c1c"],
  "t-white": ["#f4f4f8", "#0f172a"],
  "t-white-2": ["#e9e9f3", "#1f2937"],
  "t-white-3": ["#e7e7f4", "#334155"],
  "t-white-4": ["#f0f0fa", "#475569"],
  "t-slate-1": ["#8b8ba2", "#475569"],
  "t-slate-2": ["#9a9ab0", "#4b5563"],
  "t-slate-3": ["#6f6f86", "#64748b"],
  "t-slate-4": ["#4a4a60", "#94a3b8"],
  "t-slate-5": ["#7b7b93", "#64748b"],
  "t-slate-6": ["#9d9db2", "#64748b"],
  "t-slate-7": ["#7e7e95", "#64748b"],
  "t-slate-8": ["#c3c3d6", "#475569"],
  "t-slate-9": ["#9d9db4", "#64748b"],
  "t-slate-10": ["#a9a9bc", "#64748b"],
  "t-slate-11": ["#8f8fa5", "#64748b"],
  "c-green": ["#22c55e", "#16a34a"],
  "c-blue": ["#3b82f6", "#2563eb"],
  "c-purple": ["#a855f7", "#9333ea"],
  "c-pink": ["#ec4899", "#db2777"],
  "c-orange": ["#f97316", "#ea580c"],
  "c-red": ["#ef4444", "#dc2626"],
  "c-yellow": ["#eab308", "#ca8a04"],
  "c-teal": ["#14b8a6", "#0d9488"],
  "c-violet": ["#8b5cf6", "#7c3aed"],
  "c-violet-2": ["#7c3aed", "#6d28d9"],
  "c-lime": ["#84cc16", "#65a30d"],
  "c-purple-2": ["#c084fc", "#a855f7"],
  "c-pink-2": ["#f472b6", "#db2777"],
  "c-orange-2": ["#fb923c", "#ea580c"],
  "c-teal-2": ["#2dd4bf", "#0d9488"],
  "c-emerald": ["#10b981", "#059669"],
  "c-indigo": ["#6366f1", "#4f46e5"],
  "c-indigo-2": ["#818cf8", "#6366f1"],
  "c-cyan": ["#06b6d4", "#0891b2"],
  "c-rose": ["#f43f5e", "#e11d48"],
};
for (const [n, [d, l]] of Object.entries(CHART)) add(`ch-${n}`, d, l);

const darkBody = rows.map(([n, d]) => `  --c-${n}: ${chan(d)};`).join("\n");
const lightBody = rows.map(([n, , l]) => `  --c-${n}: ${chan(l)};`).join("\n");
const out = `/**
 * @file theme.css
 * @description Role-aware color tokens for the dashboard. Every token stores space-separated sRGB
 * channels so Tailwind's \`<alpha-value>\` placeholder can compose opacity modifiers (for example
 * \`bg-surface-2/60\`). The dark theme is the default; \`html.light\` overrides every token with its
 * light-mode counterpart.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

:root {
  color-scheme: dark;

${darkBody}
}

html.light {
  color-scheme: light;

${lightBody}
}
`;
fs.writeFileSync(path.join(ROOT, "client/src/theme.css"), out);
console.log("tokens:", rows.length);
