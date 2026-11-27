/**
 * @file editors.test.ts
 * @description Verifies editor preference validation and folder URI safety across
 * POSIX/Windows paths, corrupt storage, and local versus remote sessions.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/lib/__tests__/editors.test.ts
 * **Area:** client test
 * **Responsibility:**
 * Verifies editor preference validation and folder URI safety across POSIX/Windows paths, corrupt
 * storage, and local versus remote sessions.
 *
 * ## Architectural boundary
 * - Protects an observable client contract using Vitest and, for UI, Testing Library semantics.
 * - The test should fail for a meaningful production regression, not for harmless implementation
 *   rearrangement.
 * - Mocks isolate unavailable boundaries; they should not replace the behavior that the test claims
 *   to prove.
 *
 * ## Local dependency edges
 * - `../editors` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 *
 * ## Package dependency edges
 * - `vitest` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Named test contracts
 * - `blocks remote data and non-loopback dashboard origins` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `drops unknown editors and duplicates and repairs a removed default` — executable behavior
 *   named by this suite; preserve the observable contract or update the test with rationale.
 * - `editor folder links` — executable behavior named by this suite; preserve the observable
 *   contract or update the test with rationale.
 * - `editor preferences` — executable behavior named by this suite; preserve the observable
 *   contract or update the test with rationale.
 * - `encodes spaces, unicode, query/fragment delimiters and literal percent signs` — executable
 *   behavior named by this suite; preserve the observable contract or update the test with
 *   rationale.
 * - `never accepts arbitrary URI schemes` — executable behavior named by this suite; preserve the
 *   observable contract or update the test with rationale.
 * - `reports storage write failure` — executable behavior named by this suite; preserve the
 *   observable contract or update the test with rationale.
 * - `saves validated preferences and emits a same-tab update` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `supports Windows drive paths and root directories` — executable behavior named by this suite;
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/lib/__tests__/editors.test.ts` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  editorFolderUrl,
  editorUnavailableReason,
  parseEditorPrefs,
  saveEditorPrefs,
  type EditorId,
} from "../editors";

beforeEach(() => localStorage.clear());

describe("editor preferences", () => {
  it.each([null, "invalid", "null", "[]", "42"])("handles absent or corrupt storage: %s", (raw) => {
    expect(parseEditorPrefs(raw)).toEqual({ enabled: [], defaultId: null });
  });

  it("drops unknown editors and duplicates and repairs a removed default", () => {
    expect(
      parseEditorPrefs(
        JSON.stringify({
          enabled: ["cursor", "cursor", "javascript", 1, null, "vscode"],
          defaultId: "removed",
        })
      )
    ).toEqual({ enabled: ["cursor", "vscode"], defaultId: "cursor" });
    expect(
      parseEditorPrefs(JSON.stringify({ enabled: ["cursor", "vscode"], defaultId: "vscode" }))
        .defaultId
    ).toBe("vscode");
    expect(
      parseEditorPrefs(JSON.stringify({ enabled: [], defaultId: "vscode" })).defaultId
    ).toBeNull();
  });

  it("saves validated preferences and emits a same-tab update", () => {
    const listener = vi.fn();
    window.addEventListener("ccam-editors-changed", listener);
    try {
      expect(saveEditorPrefs({ enabled: ["cursor"], defaultId: "cursor" })).toBe(true);
      expect(parseEditorPrefs(localStorage.getItem("ccam-editors"))).toEqual({
        enabled: ["cursor"],
        defaultId: "cursor",
      });
      expect(listener).toHaveBeenCalledOnce();
    } finally {
      window.removeEventListener("ccam-editors-changed", listener);
    }
  });

  it("reports storage write failure", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    try {
      expect(saveEditorPrefs({ enabled: ["vscode"], defaultId: "vscode" })).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("editor folder links", () => {
  it("encodes spaces, unicode, query/fragment delimiters and literal percent signs", () => {
    const url = editorFolderUrl("vscode", "/Users/dev/my project/中文#foo?x=%20");
    expect(url).toBe("vscode://file/Users/dev/my%20project/%E4%B8%AD%E6%96%87%23foo%3Fx%3D%2520/");
    expect(new URL(url!).search).toBe("");
    expect(new URL(url!).hash).toBe("");
  });

  it("supports Windows drive paths and root directories", () => {
    expect(editorFolderUrl("cursor", "C:\\Users\\dev\\my project")).toBe(
      "cursor://file/C:/Users/dev/my%20project/"
    );
    expect(editorFolderUrl("vscode", "D:/code/")).toBe("vscode://file/D:/code/");
    expect(editorFolderUrl("vscode", "/")).toBe("vscode://file/");
  });

  it.each([
    null,
    "",
    "relative/path",
    "~/code",
    "//host/share",
    "\\\\host\\share",
    "/bad\npath",
    "/bad\u0000path",
    "/bad\\path",
    "/bad\ud800",
  ])("rejects unsupported paths: %s", (path) => {
    expect(editorFolderUrl("vscode", path)).toBeNull();
  });

  it("never accepts arbitrary URI schemes", () => {
    expect(editorFolderUrl("javascript" as EditorId, "/code")).toBeNull();
  });

  it("blocks remote data and non-loopback dashboard origins", () => {
    expect(editorUnavailableReason({ cwd: "/code", source: "remote-1" }, "localhost")).toBe(
      "remote"
    );
    expect(editorUnavailableReason({ cwd: "/code", source: "local" }, "server.example.com")).toBe(
      "remote"
    );
    expect(editorUnavailableReason({ cwd: "/code" }, "127.0.0.1.evil.com")).toBe("remote");
    for (const host of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
      expect(editorUnavailableReason({ cwd: "/code" }, host)).toBeNull();
    }
    expect(editorUnavailableReason({ cwd: null }, "localhost")).toBe("missingFolder");
  });
});
