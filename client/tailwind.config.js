/**
 * @file tailwind.config.js
 * @description Tailwind CSS configuration - content globs and the dashboard's role-aware design
 * tokens. Every color resolves to a CSS variable defined in `src/theme.css`, so the same utility
 * class renders correctly in both the dark (default) and light themes.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

/** Resolve a theme token stored as space-separated sRGB channels. */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/**
 * Build a color group for one Tailwind role from `family -> shades` pairs.
 * Only the shades listed here are overridden; every other shade keeps the Tailwind default.
 */
const group = (prefix, families) =>
  Object.fromEntries(
    families.map(([family, shades]) => [
      family,
      Object.fromEntries(shades.map((shade) => [shade, token(`${prefix}-${family}-${shade}`)])),
    ])
  );

/* Foreground ramp: neutral shades are inverted in light mode so emphasis is preserved. */
const textFamilies = [
  ["gray", [50, 100, 200, 300, 400, 500, 600, 700]],
  ["slate", [300, 400]],
  ["amber", [100, 200, 300, 400, 500]],
  ["blue", [200, 300, 400]],
  ["cyan", [200, 300, 400]],
  ["emerald", [100, 200, 300, 400, 500]],
  ["fuchsia", [300]],
  ["green", [200, 400]],
  ["indigo", [200, 300, 400]],
  ["orange", [300]],
  ["pink", [300]],
  ["red", [100, 200, 300, 400]],
  ["rose", [200, 300, 400, 500]],
  ["sky", [300, 400]],
  ["teal", [200, 300]],
  ["violet", [200, 300, 400]],
  ["yellow", [200, 300, 400]],
];

/* Surface ramp: pale steps are deepened in light mode so they stay visible on white. */
const bgFamilies = [
  ["gray", [400, 500, 600, 700, 800, 900]],
  ["slate", [400, 500]],
  ["amber", [400, 500]],
  ["blue", [400, 500]],
  ["cyan", [400, 500]],
  ["emerald", [400, 500]],
  ["fuchsia", [500]],
  ["green", [500]],
  ["indigo", [400, 500]],
  ["orange", [400, 500]],
  ["pink", [400, 500]],
  ["red", [400, 500, 600, 950]],
  ["rose", [500]],
  ["sky", [500]],
  ["teal", [500]],
  ["violet", [400, 500, 600]],
  ["yellow", [400, 500]],
];

const borderFamilies = [
  ["gray", [500, 600, 700, 800]],
  ["slate", [500]],
  ["amber", [400, 500]],
  ["blue", [400, 500]],
  ["cyan", [500]],
  ["emerald", [400, 500]],
  ["fuchsia", [500]],
  ["green", [500]],
  ["indigo", [500]],
  ["orange", [500]],
  ["pink", [500]],
  ["red", [500]],
  ["rose", [500]],
  ["sky", [500]],
  ["teal", [400, 500]],
  ["violet", [400, 500]],
  ["yellow", [500]],
];

const ringFamilies = [
  ["amber", [400, 500]],
  ["blue", [400]],
  ["cyan", [500]],
  ["emerald", [500]],
  ["fuchsia", [500]],
  ["indigo", [500]],
  ["orange", [500]],
  ["pink", [500]],
  ["rose", [500]],
  ["sky", [500]],
  ["slate", [400, 500]],
  ["teal", [400, 500]],
  ["violet", [400, 500]],
];

/** Gradient stops reuse the surface ramp so `from-*`/`to-*` track the panel colors. */
const stopFamilies = [
  ["amber", [500]],
  ["blue", [500]],
  ["cyan", [500]],
  ["emerald", [500]],
  ["fuchsia", [500]],
  ["gray", [500]],
  ["indigo", [500]],
  ["orange", [500]],
  ["red", [500]],
  ["slate", [500]],
  ["teal", [500]],
  ["violet", [500]],
];

/** Provider brand accents, kept recognizable but darkened for light-mode legibility. */
const brandColors = {
  slack: token("brand-slack"),
  discord: token("brand-discord"),
  teams: token("brand-teams"),
  "google-chat": token("brand-google-chat"),
  mattermost: token("brand-mattermost"),
  rocketchat: token("brand-rocketchat"),
  telegram: token("brand-telegram"),
  pagerduty: token("brand-pagerduty"),
  opsgenie: token("brand-opsgenie"),
  "splunk-oncall": token("brand-splunk-oncall"),
};

/** Chart palette exposed as Tailwind colors for the few arbitrary-value call sites. */
const chartColors = {
  canvas: token("ch-canvas"),
  panel: token("ch-panel"),
  empty: token("ch-empty"),
  grid: token("ch-grid"),
  border: token("ch-border"),
  "track-border": token("ch-track-border"),
  node: token("ch-node"),
  "node-stroke": token("ch-node-stroke"),
  text: token("ch-text"),
  "text-2": token("ch-text-2"),
  "text-3": token("ch-text-3"),
  muted: token("ch-muted"),
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      textColor: {
        ...group("t", textFamilies),
        accent: { DEFAULT: token("t-accent"), hover: token("t-accent-hover") },
        "fg-strong": token("t-fg-strong"),
        brand: brandColors,
        ch: chartColors,
      },
      backgroundColor: {
        ...group("b", bgFamilies),
        surface: {
          0: token("b-surface-0"),
          1: token("b-surface-1"),
          2: token("b-surface-2"),
          3: token("b-surface-3"),
          4: token("b-surface-4"),
          5: token("b-surface-5"),
        },
        border: token("b-border"),
        accent: {
          DEFAULT: token("b-accent"),
          hover: token("b-accent-hover"),
          muted: "rgb(var(--c-b-accent) / 0.15)",
        },
        tint: token("b-tint"),
        "code-panel": token("b-code-panel"),
        "code-header": token("b-code-header"),
        "code-row": token("b-code-row"),
        "code-pre": token("b-code-pre"),
        "code-inline": token("b-code-inline"),
        brand: brandColors,
        ch: chartColors,
      },
      borderColor: {
        ...group("bd", borderFamilies),
        border: {
          DEFAULT: token("bd-border"),
          light: token("bd-border-light"),
          strong: token("bd-border-strong"),
        },
        surface: {
          1: token("bd-surface-1"),
          3: token("bd-surface-3"),
          4: token("bd-surface-4"),
        },
        accent: { DEFAULT: token("bd-accent") },
        tint: token("b-tint"),
        brand: brandColors,
        ch: chartColors,
      },
      ringColor: {
        ...group("r", ringFamilies),
        accent: { DEFAULT: token("r-accent") },
        tint: token("b-tint"),
      },
      divideColor: {
        border: token("dv-border"),
        surface: { 4: token("dv-surface-4") },
      },
      placeholderColor: {
        ...group("ph", [["gray", [500, 600]]]),
      },
      fill: {
        ...group("fl", [["gray", [100, 300, 600]]]),
      },
      gradientColorStops: {
        ...group("b", stopFamilies),
        surface: {
          1: token("b-surface-1"),
          2: token("b-surface-2"),
          3: token("b-surface-3"),
        },
        accent: { DEFAULT: token("b-accent") },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
