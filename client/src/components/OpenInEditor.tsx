/**
 * @file OpenInEditor.tsx
 * @description Shared session-folder launcher for cards, list rows, and details.
 * Uses explicit editor links and disables remote or missing-path sessions.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/components/OpenInEditor.tsx
 * **Area:** client component
 * **Responsibility:**
 * Shared session-folder launcher for cards, list rows, and details. Uses explicit editor links and
 * disables remote or missing-path sessions.
 *
 * ## Architectural boundary
 * - This component should express one reusable UI responsibility through typed props and observable
 *   callbacks.
 * - Network orchestration belongs in pages, hooks, or the typed API client unless this component
 *   explicitly owns the workflow.
 * - Visual state must remain a projection of props and local interaction state rather than a second
 *   server truth.
 *
 * ## Local dependency edges
 * - `../lib/editors` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 * - `../lib/types` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 *
 * ## Package dependency edges
 * - `lucide-react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 * - `react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 * - `react-i18next` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 * - `react-router` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Public surface
 * - `OpenInEditor` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `OpenInEditor` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 *
 * ## React and framework hooks
 * - `useEditorPrefs` — lifecycle/state dependency detected in this module; preserve dependency
 *   freshness and cleanup semantics.
 * - `useState` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 * - `useTranslation` — lifecycle/state dependency detected in this module; preserve dependency
 *   freshness and cleanup semantics.
 *
 * ## Translation namespaces
 * - `settings` — visible copy resolves through this namespace; key and interpolation parity applies
 *   to every supported locale.
 *
 * ## Area invariants
 * - Keep prop meaning and callback timing stable; parent components often rely on both even when
 *   types still compile.
 * - Render valid semantic controls with accessible names, focus behavior, disabled states, and
 *   keyboard operation.
 * - Keep visible strings in the appropriate i18n namespace rather than embedding English-only
 *   literals.
 * - Use shared design tokens and existing primitives so light/dark styling and compact layouts
 *   remain coherent.
 * - Avoid mutating arrays or objects received through props; derived display data should be
 *   computed immutably.
 * - Make empty and unavailable values explicit instead of rendering misleading zeroes or
 *   placeholder punctuation.
 * - Keep event handlers narrow and prevent accidental bubbling only when the enclosing interaction
 *   requires it.
 * - Do not duplicate server validation or destructive gates as if client-side checks were
 *   authoritative.
 * - Preserve responsive behavior at narrow widths and avoid fixed dimensions that clip translated
 *   copy.
 * - Prefer stable keys derived from entity identity over array indexes for live, filtered, or
 *   reordered collections.
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/components/OpenInEditor.tsx` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { useState } from "react";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  EDITORS,
  editorFolderUrl,
  editorUnavailableReason,
  useEditorPrefs,
  type EditorId,
} from "../lib/editors";
import type { Session } from "../lib/types";

export function OpenInEditor({
  session,
  compact = false,
}: {
  session: Pick<Session, "id" | "cwd" | "source">;
  compact?: boolean;
}) {
  const { t } = useTranslation("settings");
  const prefs = useEditorPrefs();
  const [selection, setSelection] = useState<{ sessionId: string; id: EditorId } | null>(null);
  const id =
    selection?.sessionId === session.id && prefs.enabled.includes(selection.id)
      ? selection.id
      : prefs.defaultId;
  const editor = EDITORS.find((entry) => entry.id === id);
  const reason = editorUnavailableReason(session);
  const url = id ? editorFolderUrl(id, session.cwd) : null;
  const label = editor ? t("editors.openWith", { editor: editor.name }) : t("editors.configure");
  const unavailable = reason ?? (id && !url ? "missingFolder" : null);

  return (
    <div
      className="inline-flex items-center gap-1 shrink-0"
      onClick={(event) => event.stopPropagation()}
    >
      {unavailable ? (
        <button
          type="button"
          disabled
          className="btn-ghost opacity-40"
          aria-label={t("editors.open")}
          title={t(`editors.${unavailable}`)}
        >
          <Code2 className="w-3.5 h-3.5" />
          {!compact && t("editors.open")}
        </button>
      ) : url ? (
        <a href={url} className="btn-ghost" aria-label={label} title={`${label} · ${session.cwd}`}>
          <Code2 className="w-3.5 h-3.5" />
          {!compact && label}
        </a>
      ) : (
        <Link to="/settings#editors" className="btn-ghost" aria-label={label} title={label}>
          <Code2 className="w-3.5 h-3.5" />
          {!compact && label}
        </Link>
      )}
      {!unavailable && prefs.enabled.length > 1 && (
        <select
          className="bg-surface-2 text-xs text-gray-400 rounded max-w-28"
          aria-label={t("editors.choose")}
          value={id ?? ""}
          onChange={(event) =>
            setSelection({ sessionId: session.id, id: event.target.value as EditorId })
          }
        >
          {prefs.enabled.map((enabledId) => (
            <option key={enabledId} value={enabledId}>
              {EDITORS.find((entry) => entry.id === enabledId)?.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
