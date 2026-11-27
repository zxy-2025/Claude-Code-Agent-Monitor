/**
 * @file editors.ts
 * @description Browser-local editor preferences and safe folder links for a fixed
 * catalog of installed editors. Never runs commands or opens remote session paths.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/lib/editors.ts
 * **Area:** client library
 * **Responsibility:**
 * Browser-local editor preferences and safe folder links for a fixed catalog of installed editors.
 * Never runs commands or opens remote session paths.
 *
 * ## Architectural boundary
 * - Provides shared typed behavior or wire contracts consumed by multiple client screens and
 *   components.
 * - Keep functions deterministic and side effects explicit; central helpers amplify both correct
 *   behavior and regressions.
 * - Types mirroring server payloads must stay aligned with serializers, OpenAPI descriptions, and
 *   WebSocket messages.
 *
 * ## Local dependency edges
 * - `./types` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 *
 * ## Package dependency edges
 * - `react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Public surface
 * - `editorFolderUrl` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `EditorId` (type) — exported contract; search downstream imports and tests before changing its
 *   name, shape, or timing.
 * - `EditorPrefs` (interface) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `EDITORS` (variable) — exported contract; search downstream imports and tests before changing
 *   its name, shape, or timing.
 * - `editorUnavailableReason` (function) — exported contract; search downstream imports and tests
 *   before changing its name, shape, or timing.
 * - `parseEditorPrefs` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `saveEditorPrefs` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 * - `useEditorPrefs` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `CHANGE_EVENT` (variable) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `editorFolderUrl` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `EditorId` (type) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `EditorPrefs` (interface) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `EDITORS` (variable) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `editorUnavailableReason` (function) — top-level declaration that helps orient code review and
 *   focused test selection.
 * - `folderPath` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `isEditorId` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `parseEditorPrefs` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `saveEditorPrefs` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `snapshot` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `STORAGE_KEY` (variable) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `subscribe` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `useEditorPrefs` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 *
 * ## React and framework hooks
 * - `useMemo` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 * - `useSyncExternalStore` — lifecycle/state dependency detected in this module; preserve
 *   dependency freshness and cleanup semantics.
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/lib/editors.ts` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { useMemo, useSyncExternalStore } from "react";
import type { Session } from "./types";

export const EDITORS = [
  { id: "vscode", name: "VS Code", scheme: "vscode" },
  { id: "vscode-insiders", name: "VS Code Insiders", scheme: "vscode-insiders" },
  { id: "cursor", name: "Cursor", scheme: "cursor" },
  { id: "windsurf", name: "Windsurf", scheme: "windsurf" },
  { id: "vscodium", name: "VSCodium", scheme: "vscodium" },
] as const;
export type EditorId = (typeof EDITORS)[number]["id"];
export interface EditorPrefs {
  enabled: EditorId[];
  defaultId: EditorId | null;
}

const STORAGE_KEY = "ccam-editors";
const CHANGE_EVENT = "ccam-editors-changed";

function isEditorId(value: unknown): value is EditorId {
  return EDITORS.some((editor) => editor.id === value);
}

/** Treat persisted preferences as untrusted; arbitrary URI schemes are never accepted. */
export function parseEditorPrefs(raw: string | null): EditorPrefs {
  try {
    const value = JSON.parse(raw || "null");
    const enabled: EditorId[] = Array.isArray(value?.enabled)
      ? [...new Set<EditorId>(value.enabled.filter(isEditorId))]
      : [];
    return {
      enabled,
      defaultId: enabled.includes(value?.defaultId) ? value.defaultId : (enabled[0] ?? null),
    };
  } catch {
    return { enabled: [], defaultId: null };
  }
}

function snapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

export function useEditorPrefs(): EditorPrefs {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseEditorPrefs(raw), [raw]);
}

/** Return false rather than claiming preferences were saved when storage is unavailable. */
export function saveEditorPrefs(prefs: EditorPrefs): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parseEditorPrefs(JSON.stringify(prefs))));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function editorUnavailableReason(
  session: Pick<Session, "cwd" | "source">,
  hostname = window.location.hostname
): "remote" | "missingFolder" | null {
  // A session's "local" source means local to the server, not necessarily the browser.
  if (
    (session.source && session.source !== "local") ||
    !["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname)
  )
    return "remote";
  return folderPath(session.cwd) === null ? "missingFolder" : null;
}

function folderPath(cwd: string | null): string | null {
  if (!cwd || /[\u0000-\u001f\u007f]/.test(cwd)) return null;
  const path = /^[a-z]:[\\/]/i.test(cwd) ? `/${cwd.replace(/\\/g, "/")}` : cwd;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return null;
  return path;
}

/** Encode path segments, not a full URL, so paths cannot inject queries or fragments. */
export function editorFolderUrl(id: EditorId, cwd: string | null): string | null {
  const editor = EDITORS.find((entry) => entry.id === id);
  const path = folderPath(cwd);
  if (!editor || path === null) return null;
  try {
    const encoded = path
      .split("/")
      .map((part, index) =>
        index === 1 && /^[a-z]:$/i.test(part) ? part : encodeURIComponent(part)
      )
      .join("/");
    return `${editor.scheme}://file${encoded.endsWith("/") ? encoded : `${encoded}/`}`;
  } catch {
    return null;
  }
}
