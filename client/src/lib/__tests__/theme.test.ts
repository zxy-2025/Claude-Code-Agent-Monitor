/**
 * @file theme.test.ts
 * @description Verifies the light/dark theme contract: the default palette, the class swap on
 * `<html>`, persistence in `localStorage`, and the React toggle exposed by `useTheme`.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/lib/__tests__/theme.test.ts
 * **Area:** client test
 * **Responsibility:**
 * Verifies the light/dark theme contract: the default palette, the class swap on `<html>` ,
 * persistence in `localStorage` , and the React toggle exposed by `useTheme` .
 *
 * ## Architectural boundary
 * - Protects an observable client contract using Vitest and, for UI, Testing Library semantics.
 * - The test should fail for a meaningful production regression, not for harmless implementation
 *   rearrangement.
 * - Mocks isolate unavailable boundaries; they should not replace the behavior that the test claims
 *   to prove.
 *
 * ## Local dependency edges
 * - `../../hooks/useTheme` — repository-local contract consumed by this module; review its exports
 *   before changing assumptions here.
 * - `../theme` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 *
 * ## Package dependency edges
 * - `@testing-library/react` — external package boundary; keep usage within the installed version
 *   and the repository's existing adapter patterns.
 * - `vitest` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## React and framework hooks
 * - `useTheme` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 *
 * ## Named test contracts
 * - `applies the stored theme on startup` — executable behavior named by this suite; preserve the
 *   observable contract or update the test with rationale.
 * - `defaults to the light palette when nothing is stored` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `ignores a corrupt stored value and falls back to the default` — executable behavior named by
 *   this suite; preserve the observable contract or update the test with rationale.
 * - `round-trips a stored theme` — executable behavior named by this suite; preserve the observable
 *   contract or update the test with rationale.
 * - `swaps the light and dark classes on the document root` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `theme` — executable behavior named by this suite; preserve the observable contract or update
 *   the test with rationale.
 * - `toggles the theme and remembers the choice` — executable behavior named by this suite;
 *   preserve the observable contract or update the test with rationale.
 *
 * ## Area invariants
 * - Name the user-visible or contract-level behavior in each test title so failures explain the
 *   regression.
 * - Query rendered UI by role, accessible name, or meaningful text before reaching for
 *   implementation selectors.
 * - Reset mocks, timers, globals, storage, and DOM state so execution order cannot change outcomes.
 * - Await asynchronous rendering and user interactions instead of relying on arbitrary sleeps.
 * - Keep fixtures minimal but structurally realistic, including provider and source fields used by
 *   production branches.
 * - Assert important negative behavior when duplicate events, stale responses, or absent data are
 *   the known risk.
 * - Avoid snapshots for volatile values unless serializers normalize them and review remains
 *   readable.
 * - Exercise keyboard and accessibility behavior for controls whose semantics matter beyond visual
 *   output.
 * - Do not assert internal hook state when the same contract can be observed through rendered
 *   output or callbacks.
 * - When fixing a regression, prove the test fails on the broken implementation before accepting
 *   the fix.
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
 * - Run `npm run test:client` and resolve failures before widening the verification scope.
 * - Run `npm run typecheck:client` and resolve failures before widening the verification scope.
 * - Run `npm run verify` and resolve failures before widening the verification scope.
 *
 * ## Reference maintenance
 * - Regenerate all tracked references with `node scripts/maintain-typescript-docs.ts --write` .
 * - Check this module without writing via
 *   `node scripts/maintain-typescript-docs.ts --check client/src/lib/__tests__/theme.test.ts` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  initTheme,
  readStoredTheme,
  storeTheme,
} from "../theme";
import { useTheme } from "../../hooks/useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("theme", () => {
  it("defaults to the light palette when nothing is stored", () => {
    expect(DEFAULT_THEME).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("swaps the light and dark classes on the document root", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    applyTheme("dark");
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("ignores a corrupt stored value and falls back to the default", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "not-a-theme");
    expect(readStoredTheme()).toBe("light");
  });

  it("round-trips a stored theme", () => {
    storeTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("applies the stored theme on startup", () => {
    storeTheme("dark");
    expect(initTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles the theme and remembers the choice", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe("light");
    expect(result.current.isLight).toBe(true);

    act(() => result.current.toggle());

    expect(result.current.mode).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
