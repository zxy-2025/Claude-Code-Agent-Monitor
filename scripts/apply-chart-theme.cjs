/**
 * @file apply-chart-theme.cjs
 * @description Rewrites the dashboard's hardcoded chart colors into theme tokens so the light
 * and dark palettes both work.
 *
 * The charts (D3 graphs, Sankey flows, tooltips, the splash screen) paint with literal hex and
 * `rgba()` values, which cannot follow a CSS-variable driven theme. This codemod maps each of
 * those literals onto a `--c-ch-*` custom property declared in `client/src/theme.css`, and swaps
 * the handful of dark-only Tailwind utilities (code panels, hover tints) for their themed
 * equivalents.
 *
 * It is idempotent: literals that have already been converted are left alone, so it is safe to
 * re-run after pulling a new upstream release.
 *
 * Usage: `node scripts/apply-chart-theme.cjs [--check] [--src <client/src dir>]`
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const sourceArgIndex = process.argv.indexOf("--src");
const CLIENT_SRC =
  sourceArgIndex > 0 && process.argv[sourceArgIndex + 1]
    ? path.resolve(process.argv[sourceArgIndex + 1])
    : path.join(ROOT, "client", "src");

/** Literal hex color -> chart token name (without the `--c-` prefix). */
const HEX_TOKENS = {
  "#06060a": "ch-splash-bg",
  "#07070d": "ch-splash-bg2",
  "#05050a": "ch-splash-bg3",
  "#12121f": "ch-canvas",
  "#161625": "ch-empty",
  "#1e1e2e": "ch-panel",
  "#2a2a4a": "ch-grid",
  "#2a2a3d": "ch-line",
  "#363650": "ch-border",
  "#303044": "ch-track",
  "#30304d": "ch-track-border",
  "#1a1a28": "ch-node",
  "#1f1f30": "ch-node-stroke",
  "#e2e8f0": "ch-text",
  "#e4e4ed": "ch-text-strong",
  "#cbd5e1": "ch-text-2",
  "#d1d5db": "ch-text-2b",
  "#94a3b8": "ch-text-3",
  "#9ca3af": "ch-text-3b",
  "#374151": "ch-text-4",
  "#64748b": "ch-axis",
  "#6b7280": "ch-muted",
  "#052e16": "ch-ok-bg",
  "#16a34a": "ch-ok-stroke",
  "#4ade80": "ch-ok-text",
  "#1f0808": "ch-err-bg",
  "#dc2626": "ch-err-stroke",
  "#f87171": "ch-err-text",
  "#7f1d1d": "ch-err-deep",
  "#1c1a04": "ch-warn-bg",
  "#ca8a04": "ch-warn-stroke",
  "#facc15": "ch-warn-text",
  "#312e81": "ch-grad-indigo",
  "#4338ca": "ch-grad-indigo-2",
  "#4f46e5": "ch-grad-indigo-3",
  "#3730a3": "ch-grad-violet-2",
  "#1e3a5f": "ch-grad-blue",
  "#1d4ed8": "ch-grad-blue-2",
  "#166534": "ch-grad-green",
  "#134e4a": "ch-grad-teal",
  "#1e1b4b": "ch-grad-violet",
  "#065f46": "ch-grad-emerald",
  "#e0e7ff": "ch-grad-pale",
  "#24234b": "ch-splash-deep",
  "#1f1f35": "ch-splash-panel",
  "#141421": "ch-splash-panel2",
  "#5b5b86": "ch-cat-1",
  "#43436a": "ch-cat-2",
  "#343352": "ch-cat-3",
  "#e9d5ff": "ch-t-fuchsia",
  "#bfdbfe": "ch-t-blue",
  "#a7f3d0": "ch-t-emerald",
  "#5eead4": "ch-t-teal",
  "#c4b5fd": "ch-t-violet",
  "#a78bfa": "ch-t-violet-2",
  "#93c5fd": "ch-t-blue-2",
  "#86efac": "ch-t-green",
  "#a5b4fc": "ch-t-indigo",
  "#c7d2fe": "ch-t-indigo-2",
  "#e5e7ff": "ch-t-indigo-3",
  "#e3e4ff": "ch-t-indigo-7",
  "#7375b9": "ch-t-indigo-4",
  "#7477f7": "ch-t-indigo-5",
  "#ececff": "ch-t-indigo-6",
  "#fbbf24": "ch-t-amber",
  "#f59e0b": "ch-t-amber-2",
  "#f5cd72": "ch-t-amber-3",
  "#f5d991": "ch-t-amber-4",
  "#b4690f": "ch-t-amber-deep",
  "#22d3ee": "ch-t-cyan",
  "#34d399": "ch-t-emerald-2",
  "#60a5fa": "ch-t-blue-3",
  "#f7c948": "ch-t-gold",
  "#f5be50": "ch-t-gold-2",
  "#a8e2c4": "ch-t-mint",
  "#bae6d1": "ch-t-mint-2",
  "#fecaca": "ch-t-red-pale",
  "#f4f4f8": "ch-t-white",
  "#e9e9f3": "ch-t-white-2",
  "#e7e7f4": "ch-t-white-3",
  "#f0f0fa": "ch-t-white-4",
  "#8b8ba2": "ch-t-slate-1",
  "#9a9ab0": "ch-t-slate-2",
  "#6f6f86": "ch-t-slate-3",
  "#4a4a60": "ch-t-slate-4",
  "#7b7b93": "ch-t-slate-5",
  "#9d9db2": "ch-t-slate-6",
  "#7e7e95": "ch-t-slate-7",
  "#c3c3d6": "ch-t-slate-8",
  "#9d9db4": "ch-t-slate-9",
  "#a9a9bc": "ch-t-slate-10",
  "#8f8fa5": "ch-t-slate-11",
  "#22c55e": "ch-c-green",
  "#3b82f6": "ch-c-blue",
  "#a855f7": "ch-c-purple",
  "#ec4899": "ch-c-pink",
  "#f97316": "ch-c-orange",
  "#ef4444": "ch-c-red",
  "#eab308": "ch-c-yellow",
  "#14b8a6": "ch-c-teal",
  "#8b5cf6": "ch-c-violet",
  "#7c3aed": "ch-c-violet-2",
  "#84cc16": "ch-c-lime",
  "#c084fc": "ch-c-purple-2",
  "#f472b6": "ch-c-pink-2",
  "#fb923c": "ch-c-orange-2",
  "#2dd4bf": "ch-c-teal-2",
  "#10b981": "ch-c-emerald",
  "#6366f1": "ch-c-indigo",
  "#818cf8": "ch-c-indigo-2",
  "#06b6d4": "ch-c-cyan",
  "#f43f5e": "ch-c-rose",
};

/** `rgba()` base color -> token name. Keys are the normalized channel list. */
const RGBA_TOKENS = {
  "165, 180, 252": "ch-t-indigo",
  "129, 140, 248": "ch-c-indigo-2",
  "99, 102, 241": "ch-c-indigo",
  "180, 105, 15": "ch-t-amber-deep",
  "245, 190, 80": "ch-t-gold-2",
  "248, 113, 113": "ch-err-text",
  "127, 29, 29": "ch-err-deep",
  "6, 78, 59": "ch-grad-emerald",
  "52, 211, 153": "ch-t-emerald-2",
  "16, 185, 129": "ch-c-emerald",
  "59, 130, 246": "ch-c-blue",
  "168, 85, 247": "ch-c-purple",
  "34, 197, 94": "ch-c-green",
  "107, 114, 128": "ch-muted",
  "67, 56, 202": "ch-grad-indigo-2",
  "20, 184, 166": "ch-c-teal",
  "255, 255, 255": "b-tint",
  "224, 231, 255": "ch-grad-pale",
  "79, 70, 229": "ch-grad-indigo-3",
  "36, 35, 75": "ch-splash-deep",
  "11, 11, 20": "ch-splash-bg",
  "14, 14, 25": "ch-splash-bg",
  "49, 46, 129": "ch-grad-indigo",
  "20, 20, 33": "ch-splash-panel2",
  "31, 31, 53": "ch-splash-panel",
  "5, 5, 12": "ch-splash-bg3",
  "3, 3, 8": "ch-splash-bg3",
};

/** Whitespace-insensitive lookup for {@link RGBA_TOKENS}. */
const RGBA_LOOKUP = new Map(
  Object.entries(RGBA_TOKENS).map(([key, token]) => [key.replace(/\s+/g, ""), token])
);

/** Provider brand accents, mapped to the themed `brand-*` utilities. */
const BRAND_CLASSES = {
  "#e01e5a": "slack",
  "#5865f2": "discord",
  "#6264a7": "teams",
  "#1a73e8": "google-chat",
  "#0058cc": "mattermost",
  "#f5455c": "rocketchat",
  "#26a5e4": "telegram",
  "#06ac38": "pagerduty",
  "#2684ff": "opsgenie",
  "#f99d1c": "splunk-oncall",
};

/** Tailwind arbitrary-value classes carrying a literal chart color. */
const ARBITRARY_CLASSES = {
  "bg-[#12121f]": "bg-ch-canvas",
  "border-[#2a2a4a]": "border-ch-border",
  "border-[#30304d]": "border-ch-track-border",
};

/**
 * Dark-only Tailwind utilities replaced by themed equivalents, scoped per file so modal scrims
 * (`bg-black/60` on a `fixed inset-0` overlay) keep their dark backdrop.
 */
const CLASS_REPLACEMENTS = {
  "client/src/components/event-views/primitives.tsx": [
    [
      "bg-black/70 border border-border rounded font-mono",
      "bg-code-panel border border-border rounded font-mono",
    ],
    ["border-b border-border bg-black/40", "border-b border-border bg-code-header"],
    ["bg-black/40 border-r border-border", "bg-code-row border-r border-border"],
  ],
  "client/src/components/EventDetail.tsx": [
    [
      "bg-black/70 border border-border rounded font-mono",
      "bg-code-panel border border-border rounded font-mono",
    ],
    ["border-b border-border bg-black/40", "border-b border-border bg-code-header"],
    [
      "px-3 py-1 border-b border-border bg-black/20",
      "px-3 py-1 border-b border-border bg-code-row",
    ],
  ],
  "client/src/components/EventFiltersInfo.tsx": [
    [
      "bg-black/40 border border-border rounded p-2",
      "bg-code-inline border border-border rounded p-2",
    ],
  ],
  "client/src/components/workflows/WorkflowRunsPanel.tsx": [
    ["bg-black/30 rounded p-2", "bg-code-inline rounded p-2"],
  ],
};

/** Utilities that must follow the theme instead of staying hardcoded white/black. */
const GLOBAL_CLASS_REPLACEMENTS = [
  ["hover:bg-white/5", "hover:bg-tint/5"],
  ["hover:bg-white/10", "hover:bg-tint/10"],
  ["hover:border-white/10", "hover:border-tint/10"],
  ["hover:text-white", "hover:text-fg-strong"],
];

/**
 * Helper injected into the orchestration graph so a token color can carry an alpha channel.
 * The upstream code appends a hex alpha suffix to a literal, which no longer works once the
 * literal is a CSS variable.
 */
const WITH_ALPHA_HELPER = `/**
 * Add an alpha channel to a token color so gradients and badges can fade out.
 *
 * @param color - Color built from a theme token, for example \`rgb(var(--c-ch-ok-stroke))\`.
 * @param alpha - Opacity to apply, between 0 and 1.
 * @returns The same color with the given alpha.
 */
function withAlpha(color: string, alpha: number): string {
  return color.replace(/\\)$/, \`/\${alpha})\`);
}

`;

/** Source-level rewrites that cannot be expressed as a literal swap. */
const SOURCE_REWRITES = {
  "client/src/components/workflows/OrchestrationDAG.tsx": [
    [
      '.attr("stop-color", colors.stroke + "55");',
      '.attr("stop-color", withAlpha(colors.stroke, 0.33));',
    ],
    [
      'return outcomeColorSet(status).stroke + "33";',
      "return withAlpha(outcomeColorSet(status).stroke, 0.2);",
    ],
  ],
};

/** Collect every TypeScript/TSX source file below `client/src`, skipping tests. */
function collectSourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      out.push(...collectSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Rewrite one file's contents into its themed equivalent.
 *
 * @param {string} file - Absolute path to the source file.
 * @param {string} source - Original file contents.
 * @returns The rewritten contents.
 */
function convert(file, source) {
  let out = source;
  const relative = "client/src/" + path.relative(CLIENT_SRC, file).replace(/\\/g, "/");

  for (const [from, to] of Object.entries(ARBITRARY_CLASSES)) {
    out = out.split(from).join(to);
  }

  for (const [hex, slug] of Object.entries(BRAND_CLASSES)) {
    const badge = new RegExp(`text-\\[${hex}\\] bg-\\[${hex}\\]/10 border-\\[${hex}\\]/20`, "gi");
    out = out.replace(badge, `text-brand-${slug} bg-brand-${slug}/10 border-brand-${slug}/20`);
  }

  for (const [from, to] of CLASS_REPLACEMENTS[relative] ?? []) {
    out = out.split(from).join(to);
  }

  for (const [from, to] of GLOBAL_CLASS_REPLACEMENTS) {
    out = out.split(from).join(to);
  }

  for (const [from, to] of SOURCE_REWRITES[relative] ?? []) {
    out = out.split(from).join(to);
  }

  if (out.includes("withAlpha(") && !out.includes("function withAlpha(")) {
    const anchor = out.indexOf("const OUTCOME_COLORS");
    if (anchor > 0) {
      out = out.slice(0, anchor) + WITH_ALPHA_HELPER + out.slice(anchor);
    }
  }

  out = out.replace(
    /rgba\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*),\s*([0-9.]+)\)/g,
    (match, rgb, alpha) => {
      const key = rgb.replace(/\s+/g, "");
      const token = RGBA_LOOKUP.get(key);
      if (!token) return match;
      if (parseFloat(alpha) === 0) return match;
      return `rgb(var(--c-${token})/${alpha})`;
    }
  );

  out = out.replace(/#[0-9a-fA-F]{6}\b/g, (match) => {
    const token = HEX_TOKENS[match.toLowerCase()];
    return token ? `var(--c-${token})` : match;
  });

  // A theme token stores space-separated sRGB channels, so it is only a valid color when it is
  // wrapped in `rgb()`. Tokens that already sit inside `rgb(...)` are left alone.
  out = out.replace(/var\(--c-[a-z0-9-]+\)/g, (match, offset) => {
    const before = out.slice(Math.max(0, offset - 4), offset);
    if (/rgb\($/.test(before)) return match;
    return `rgb(${match})`;
  });

  return out;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const files = collectSourceFiles(CLIENT_SRC);
  let changed = 0;

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const converted = convert(file, source);
    if (converted === source) continue;
    changed++;
    const relative = path.relative(ROOT, file).replace(/\\/g, "/");
    if (checkOnly) {
      console.log(`pending: ${relative}`);
    } else {
      fs.writeFileSync(file, converted);
      console.log(`updated: ${relative}`);
    }
  }

  console.log(`scanned ${files.length} files, ${changed} ${checkOnly ? "pending" : "updated"}`);
  if (checkOnly && changed > 0) process.exitCode = 1;
}

main();
