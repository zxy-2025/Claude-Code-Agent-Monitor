/**
 * @file useTheme.ts
 * @description React hook exposing the dashboard's light/dark theme state.
 *
 * Wraps the plain functions in `lib/theme` with React state so components can
 * render a toggle without touching `localStorage` or the DOM themselves.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/hooks/useTheme.ts
 * **Area:** client hook
 * **Responsibility:**
 * React hook exposing the dashboard's light/dark theme state. Wraps the plain functions in
 * `lib/theme` with React state so components can render a toggle without touching `localStorage` or
 * the DOM themselves.
 *
 * ## Architectural boundary
 * - Owns a reusable React side-effect or stateful subscription while exposing a small declarative
 *   interface.
 * - The hook is responsible for setup, freshness, cleanup, and race handling; consumers should not
 *   duplicate that lifecycle.
 * - Shared transport and API semantics remain in library modules rather than being hidden inside
 *   component-specific closures.
 *
 * ## Local dependency edges
 * - `../lib/theme` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 *
 * ## Package dependency edges
 * - `react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Public surface
 * - `useTheme` (function) — exported contract; search downstream imports and tests before changing
 *   its name, shape, or timing.
 * - `UseThemeResult` (interface) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `useTheme` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `UseThemeResult` (interface) — top-level declaration that helps orient code review and focused
 *   test selection.
 *
 * ## React and framework hooks
 * - `useCallback` — lifecycle/state dependency detected in this module; preserve dependency
 *   freshness and cleanup semantics.
 * - `useState` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 *
 * ## Area invariants
 * - List every reactive dependency honestly or use stable refs intentionally with an explanatory
 *   comment.
 * - Clean up timers, sockets, observers, media objects, DOM listeners, and event-bus subscriptions
 *   on every exit path.
 * - Prevent stale async completions from updating state after unmount, reconnection, or parameter
 *   changes.
 * - Keep StrictMode mount-cleanup-remount behavior free of duplicate subscriptions and duplicate
 *   messages.
 * - Use functional state updates when the next value depends on the previous value across
 *   asynchronous callbacks.
 * - Keep callbacks stable only when consumers benefit; unnecessary memoization makes dependency
 *   contracts harder to audit.
 * - Surface recoverable status to consumers rather than swallowing failures into a permanently
 *   stale state.
 * - Do not expose mutable internal refs as if they were stable public state.
 * - Keep browser-only globals inside effect or capability checks so tests and non-browser tooling
 *   can load the module.
 * - Test mount, update, cleanup, failure, and retry behavior with the narrowest realistic
 *   dependency boundary.
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/hooks/useTheme.ts` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { useCallback, useState } from "react";
import { applyTheme, readStoredTheme, storeTheme, type ThemeMode } from "../lib/theme";

/** Theme state and a toggle callback for the current window. */
export interface UseThemeResult {
  /** Palette currently rendered. */
  mode: ThemeMode;
  /** Whether the light palette is active. */
  isLight: boolean;
  /** Switch to the other palette and remember the choice. */
  toggle: () => void;
}

/**
 * Track the active theme and expose a toggle. The DOM class and the persisted
 * preference are updated together with the React state so the two never drift.
 *
 * @returns The current theme, whether it is light, and a toggle callback.
 */
export function useTheme(): UseThemeResult {
  const [mode, setMode] = useState<ThemeMode>(() => readStoredTheme());

  const toggle = useCallback(() => {
    setMode((previous) => {
      const next: ThemeMode = previous === "light" ? "dark" : "light";
      applyTheme(next);
      storeTheme(next);
      return next;
    });
  }, []);

  return { mode, isLight: mode === "light", toggle };
}
