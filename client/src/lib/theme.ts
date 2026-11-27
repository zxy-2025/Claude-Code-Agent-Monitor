/**
 * @file theme.ts
 * @description Light/dark theme switching for the dashboard.
 *
 * The whole UI is driven by CSS custom properties declared in `theme.css`: the
 * `:root` block holds the dark palette and `html.light` overrides every token
 * with its light-mode counterpart. Switching themes therefore only toggles a
 * class on `<html>`; no component needs to re-render.
 *
 * The chosen mode is persisted in `localStorage` so it survives reloads and
 * restarts, and the initial paint is protected against a flash of the wrong
 * palette by an inline script in `index.html` that applies the stored mode
 * before the first render.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/lib/theme.ts
 * **Area:** client library
 * **Responsibility:**
 * Light/dark theme switching for the dashboard. The whole UI is driven by CSS custom properties
 * declared in `theme.css` : the `:root` block holds the dark palette and `html.light` overrides
 * every token with its light-mode counterpart. Switching themes therefore only toggles a class on
 * `<html>` ; no component needs to re-render. The chosen mode is persisted in `localStorage` so it
 * survives reloads and restarts, and the initial paint is protected against a flash of the wrong
 * palette by an inline script in `index.html` that applies the stored mode before the first render.
 *
 * ## Architectural boundary
 * - Provides shared typed behavior or wire contracts consumed by multiple client screens and
 *   components.
 * - Keep functions deterministic and side effects explicit; central helpers amplify both correct
 *   behavior and regressions.
 * - Types mirroring server payloads must stay aligned with serializers, OpenAPI descriptions, and
 *   WebSocket messages.
 *
 * ## Public surface
 * - `applyTheme` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `DEFAULT_THEME` (variable) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `initTheme` (function) — exported contract; search downstream imports and tests before changing
 *   its name, shape, or timing.
 * - `readStoredTheme` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `storeTheme` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `THEME_STORAGE_KEY` (variable) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `ThemeMode` (type) — exported contract; search downstream imports and tests before changing its
 *   name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `applyTheme` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `DEFAULT_THEME` (variable) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `initTheme` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `readStoredTheme` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `storeTheme` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `THEME_STORAGE_KEY` (variable) — top-level declaration that helps orient code review and
 *   focused test selection.
 * - `ThemeMode` (type) — top-level declaration that helps orient code review and focused test
 *   selection.
 *
 * ## Area invariants
 * - Preserve null, undefined, zero, and empty distinctions when they carry different server or
 *   presentation meaning.
 * - Do not mutate caller-owned collections in formatters, mergers, grouping helpers, or selectors.
 * - Keep stable sorting and tie-breakers explicit so live updates do not reorder equal records
 *   unpredictably.
 * - Use exhaustive checks for discriminated unions when new providers, messages, or statuses can be
 *   added.
 * - Keep URL construction encoded and route through shared auth/source-scope behavior.
 * - Return errors with enough context for the UI to explain the failed action without leaking
 *   secrets.
 * - Avoid browser globals at module evaluation time unless the module is deliberately browser-only
 *   and tested as such.
 * - Keep formatting locale-aware where the chosen UI language, not the browser default, owns the
 *   output.
 * - Document non-obvious thresholds, unit conversions, and compatibility fallbacks beside their
 *   definitions.
 * - Add table-driven tests for boundary values because library helpers often serve many visually
 *   unrelated screens.
 *
 * ## Change-review checklist
 * - Read the file header and this generated index before changing code; both describe the intended
 *   ownership boundary.
 * - Trace every local import listed here to distinguish data contracts from presentation helpers
 *   and avoid circular dependencies.
 * - Search every exported symbol before changing its signature; callers may live in tests, route
 *   components, desktop code, or MCP wiring.
 * - Keep observable behavior stable unless the task explicitly requests a behavior change and
 *   includes regression coverage.
 * - Prefer the repository's existing helpers and types over parallel abstractions that encode the
 *   same contract twice.
 * - Keep failure behavior explicit: recoverable local failures should degrade visibly without
 *   hiding actionable diagnostics.
 * - Preserve deterministic ordering for lists, maps, serialized values, snapshots, and generated
 *   output where this module participates.
 * - Treat identifiers, API paths, event names, translation keys, and persisted field names as
 *   compatibility surfaces.
 * - Update the truthful file overview when the module's responsibility changes; never let the
 *   header become historical fiction.
 * - Run the narrowest relevant test first, then the area gate, then the full repository
 *   verification before merging.
 *
 * ## Focused validation
 * - Run `npm run typecheck:client` and resolve failures before widening the verification scope.
 * - Run `npm run test:client` and resolve failures before widening the verification scope.
 * - Run `npm run verify` and resolve failures before widening the verification scope.
 *
 * ## Reference maintenance
 * - Regenerate all tracked references with `node scripts/maintain-typescript-docs.ts --write` .
 * - Check this module without writing via
 *   `node scripts/maintain-typescript-docs.ts --check client/src/lib/theme.ts` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

/** The two palettes the dashboard can render. */
export type ThemeMode = "light" | "dark";

/** `localStorage` key holding the user's last explicit theme choice. */
export const THEME_STORAGE_KEY = "ccam.theme";

/** Palette used when the user has not picked one yet. */
export const DEFAULT_THEME: ThemeMode = "light";

/**
 * Apply a theme to the document by toggling the `light` / `dark` classes on
 * `<html>`. The `light` class is what `theme.css` keys its overrides on.
 *
 * @param mode - Palette to render.
 */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

/**
 * Read the persisted theme choice, falling back to {@link DEFAULT_THEME} when
 * nothing is stored or `localStorage` is unavailable (private mode, disabled
 * storage, sandboxed iframe).
 *
 * @returns The stored theme, or the default.
 */
export function readStoredTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable - fall through to the default theme.
  }
  return DEFAULT_THEME;
}

/**
 * Persist a theme choice. Failures are ignored: the in-memory theme still
 * applies for the current session.
 *
 * @param mode - Theme to remember.
 */
export function storeTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage unavailable - the theme still applies until the page reloads.
  }
}

/**
 * Resolve the startup theme and apply it to the document. Called once before
 * React mounts so the first paint already uses the right palette.
 *
 * @returns The theme that was applied.
 */
export function initTheme(): ThemeMode {
  const mode = readStoredTheme();
  applyTheme(mode);
  return mode;
}
