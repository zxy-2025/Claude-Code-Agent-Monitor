/**
 * @file EditorSettings.tsx
 * @description Configures the installed editor catalog and default folder launcher
 * in Settings. Preferences are saved per browser, not on the CCAM server.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/components/EditorSettings.tsx
 * **Area:** client component
 * **Responsibility:**
 * Configures the installed editor catalog and default folder launcher in Settings. Preferences are
 * saved per browser, not on the CCAM server.
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
 *
 * ## Package dependency edges
 * - `lucide-react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 * - `react` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 * - `react-i18next` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Public surface
 * - `EditorSettings` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `EditorSettings` (function) — top-level declaration that helps orient code review and focused
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/components/EditorSettings.tsx` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { useState } from "react";
import { Code2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  EDITORS,
  saveEditorPrefs,
  useEditorPrefs,
  type EditorId,
  type EditorPrefs,
} from "../lib/editors";

export function EditorSettings() {
  const { t } = useTranslation("settings");
  const prefs = useEditorPrefs();
  const [selected, setSelected] = useState<EditorId>("vscode");
  const [error, setError] = useState(false);
  const available = EDITORS.filter((editor) => !prefs.enabled.includes(editor.id));
  const nextId = available.find((editor) => editor.id === selected)?.id ?? available[0]?.id;

  function save(next: EditorPrefs) {
    setError(!saveEditorPrefs(next));
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Code2 className="h-4 w-4 text-gray-500" />
          {t("editors.title")}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">{t("editors.description")}</p>
      </div>
      <div className="card p-4 space-y-4">
        {prefs.enabled.length === 0 && (
          <p className="text-xs text-gray-500">{t("editors.empty")}</p>
        )}
        {prefs.enabled.length > 0 && (
          <div role="radiogroup" aria-label={t("editors.default")} className="space-y-2">
            {prefs.enabled.map((id) => (
              <div key={id} className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="radio"
                    name="default-editor"
                    value={id}
                    checked={prefs.defaultId === id}
                    onChange={() => save({ ...prefs, defaultId: id })}
                  />
                  {EDITORS.find((editor) => editor.id === id)?.name}
                  {prefs.defaultId === id && (
                    <span aria-hidden="true" className="text-xs text-gray-500">
                      {t("editors.default")}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  className="btn-ghost"
                  aria-label={t("editors.remove", {
                    editor: EDITORS.find((editor) => editor.id === id)?.name,
                  })}
                  onClick={() =>
                    save({ ...prefs, enabled: prefs.enabled.filter((entry) => entry !== id) })
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {nextId && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label={t("editors.choose")}
              className="input text-sm"
              value={nextId}
              onChange={(event) => setSelected(event.target.value as EditorId)}
            >
              {available.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                save({ enabled: [...prefs.enabled, nextId], defaultId: prefs.defaultId ?? nextId })
              }
            >
              <Plus className="w-3.5 h-3.5" />
              {t("editors.add")}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 leading-relaxed">{t("editors.hint")}</p>
        {error && (
          <p role="alert" className="text-xs text-red-400">
            {t("editors.saveFailed")}
          </p>
        )}
      </div>
    </div>
  );
}
