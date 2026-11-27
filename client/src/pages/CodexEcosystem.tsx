/**
 * @file CodexEcosystem.tsx
 * @description Shows what the local Codex installation can reach: the installed
 * skills, the cached plugins, the configured MCP connectors, the memory
 * repository's layered architecture, and the guideline files that steer Codex.
 *
 * Everything on this page is read from the machine the dashboard runs on. The
 * server never sends a connector's environment values - only variable names
 * and the human-readable use-case hints Codex stores for them.
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */
/*
 * GENERATED_MAINTAINER_REFERENCE:BEGIN
 *
 * AUTO-GENERATED MAINTAINER REFERENCE — DO NOT EDIT THIS BLOCK BY HAND.
 * It is derived from the current TypeScript AST and repository-area contracts.
 * Regenerate after structural edits so imports, exports, landmarks, and checks stay current.
 *
 * **Module:** client/src/pages/CodexEcosystem.tsx
 * **Area:** client page
 * **Responsibility:**
 * Shows what the local Codex installation can reach: the installed skills, the cached plugins, the
 * configured MCP connectors, the memory repository's layered architecture, and the guideline files
 * that steer Codex. Everything on this page is read from the machine the dashboard runs on. The
 * server never sends a connector's environment values - only variable names and the human-readable
 * use-case hints Codex stores for them.
 *
 * ## Architectural boundary
 * - Route-level orchestration belongs here: load scoped data, subscribe to live updates, and
 *   compose reusable components.
 * - Server authority remains on the API side; the page may explain or confirm actions but must not
 *   invent authorization rules.
 * - The global data-source scope must flow through shared API helpers so local, all-source, and
 *   selected-source views agree.
 *
 * ## Local dependency edges
 * - `../components/EmptyState` — repository-local contract consumed by this module; review its
 *   exports before changing assumptions here.
 * - `../components/Skeleton` — repository-local contract consumed by this module; review its
 *   exports before changing assumptions here.
 * - `../lib/api` — repository-local contract consumed by this module; review its exports before
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
 *
 * ## Public surface
 * - `CodexEcosystem` (function) — exported contract; search downstream imports and tests before
 *   changing its name, shape, or timing.
 *
 * ## Top-level implementation landmarks
 * - `CodexEcosystem` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `ConnectorCard` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `formatBytes` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `GuidelinePanel` (function) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `MemoryPanel` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `PluginCard` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `SkillRow` (function) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `SOURCE_STYLES` (variable) — top-level declaration that helps orient code review and focused
 *   test selection.
 * - `TAB_ICONS` (variable) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `TabKey` (type) — top-level declaration that helps orient code review and focused test
 *   selection.
 * - `TABS` (variable) — top-level declaration that helps orient code review and focused test
 *   selection.
 *
 * ## React and framework hooks
 * - `useCallback` — lifecycle/state dependency detected in this module; preserve dependency
 *   freshness and cleanup semantics.
 * - `useEffect` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 * - `useMemo` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 * - `useState` — lifecycle/state dependency detected in this module; preserve dependency freshness
 *   and cleanup semantics.
 * - `useTranslation` — lifecycle/state dependency detected in this module; preserve dependency
 *   freshness and cleanup semantics.
 *
 * ## Translation namespaces
 * - `codexEcosystem` — visible copy resolves through this namespace; key and interpolation parity
 *   applies to every supported locale.
 *
 * ## Area invariants
 * - Represent loading, empty, partial, error, and refreshed states deliberately; a blank panel is
 *   not an error strategy.
 * - Cancel or ignore stale asynchronous work when parameters, source scope, or component lifetime
 *   changes.
 * - Merge WebSocket deltas without duplicating entities already returned by the REST snapshot.
 * - Keep query parameters and route state shareable when the surrounding router already exposes
 *   that state in URLs.
 * - Use translation keys for visible copy and preserve interpolation tokens across every supported
 *   locale.
 * - Keep expensive derivations memoized only when profiling or dependency stability justifies the
 *   extra contract.
 * - Preserve keyboard focus and useful headings when switching tabs, filters, drawers, or modal
 *   states.
 * - Do not make destructive requests without the confirmation and server-side gate required by the
 *   underlying API.
 * - Use canonical formatting helpers for timestamps, durations, token counts, costs, and provider
 *   labels.
 * - Keep page-level polling and event subscriptions bounded; cleanup must run on unmount and scope
 *   changes.
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/pages/CodexEcosystem.tsx` .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Blocks,
  Brain,
  Cpu,
  FileText,
  Layers,
  Package,
  Plug,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import type {
  CodexConnector,
  CodexEcosystemSnapshot,
  CodexGuideline,
  CodexMemoryArchitecture,
  CodexPlugin,
  CodexSkill,
  CodexSkillSource,
} from "../lib/types";
import { EmptyState } from "../components/EmptyState";
import { CardSkeleton } from "../components/Skeleton";

/** Tabs the page can show. */
type TabKey = "skills" | "plugins" | "connectors" | "memory" | "guidelines";

/** Tab order shown in the switcher. */
const TABS: TabKey[] = ["skills", "plugins", "connectors", "memory", "guidelines"];

/** Icon per tab. */
const TAB_ICONS: Record<TabKey, typeof Sparkles> = {
  skills: Sparkles,
  plugins: Package,
  connectors: Plug,
  memory: Brain,
  guidelines: FileText,
};

/** Badge styling per skill origin. */
const SOURCE_STYLES: Record<CodexSkillSource, string> = {
  system: "bg-violet-500/10 border-violet-500/30 text-violet-400",
  plugin: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  user: "bg-gray-500/10 border-gray-500/30 text-gray-400",
};

/**
 * Format a byte count for display.
 *
 * @param bytes - Size in bytes.
 * @returns A short human-readable size.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * One skill row: name, use case, origin, and how often it was used.
 *
 * @param props - The skill and its translated labels.
 */
function SkillRow({
  skill,
  callsLabel,
  filesLabel,
  scriptsLabel,
  sourceLabels,
}: {
  skill: CodexSkill;
  callsLabel: string;
  filesLabel: string;
  scriptsLabel: string;
  sourceLabels: Record<CodexSkillSource, string>;
}) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-100 truncate">{skill.name}</span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${SOURCE_STYLES[skill.source]}`}
            >
              {sourceLabels[skill.source]}
            </span>
            {skill.plugin && (
              <span className="text-[10px] text-gray-500 truncate">{skill.plugin}</span>
            )}
          </div>
          {skill.description && (
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">{skill.description}</p>
          )}
          <p className="mt-1 text-[11px] text-gray-500">
            {filesLabel} · {scriptsLabel}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium tabular-nums ${
            skill.calls > 0 ? "text-accent" : "text-gray-500"
          }`}
        >
          {callsLabel}
        </span>
      </div>
    </li>
  );
}

/**
 * One plugin card.
 *
 * @param props - The plugin and its translated labels.
 */
function PluginCard({
  plugin,
  versionLabel,
  versionsLabel,
  skillsLabel,
  callsLabel,
}: {
  plugin: CodexPlugin;
  versionLabel: string;
  versionsLabel: string;
  skillsLabel: string;
  callsLabel: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-sm font-medium text-gray-100 truncate">{plugin.name}</span>
            <span className="text-[10px] text-gray-500">{plugin.vendor}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {versionLabel}: {plugin.version ?? "-"}
            {plugin.versions.length > 1 && (
              <span className="text-gray-500">
                {" "}
                · {versionsLabel}: {plugin.versions.join(", ")}
              </span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">
            {skillsLabel}
            {plugin.skills.length > 0 && ` — ${plugin.skills.join(", ")}`}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium tabular-nums ${
            plugin.calls > 0 ? "text-accent" : "text-gray-500"
          }`}
        >
          {callsLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * One connector card: how it is reached, what it is for, and what was called.
 *
 * @param props - The connector and its translated labels.
 */
function ConnectorCard({
  connector,
  labels,
}: {
  connector: CodexConnector;
  labels: {
    transport: string;
    http: string;
    stdio: string;
    url: string;
    command: string;
    envKeys: string;
    referencedEnvVars: string;
    useCase: string;
    tools: string;
    calls: string;
    noCalls: string;
  };
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Plug className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-sm font-medium text-gray-100">{connector.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-600 text-gray-400">
              {connector.transport === "http" ? labels.http : labels.stdio}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">{labels.transport}</p>
          {connector.url && (
            <p className="mt-1 text-[11px] text-gray-400 font-mono break-all">{connector.url}</p>
          )}
          {connector.command && (
            <p className="mt-1 text-[11px] text-gray-400 font-mono break-all">
              {connector.command}
              {connector.args.length > 0 && ` ${connector.args.join(" ")}`}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium tabular-nums ${
            connector.calls > 0 ? "text-accent" : "text-gray-500"
          }`}
        >
          {connector.calls > 0
            ? labels.calls.replace("{{count}}", String(connector.calls))
            : labels.noCalls}
        </span>
      </div>

      {connector.useCases.length > 0 && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            {labels.useCase}
          </p>
          {connector.useCases.map((useCase, index) => (
            <p key={index} className="mt-1 text-xs text-gray-300 leading-relaxed">
              {useCase}
            </p>
          ))}
        </div>
      )}

      {(connector.envKeys.length > 0 || connector.referencedEnvVars.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
          {connector.envKeys.length > 0 && (
            <span>
              {labels.envKeys}:{" "}
              <span className="font-mono text-gray-400">{connector.envKeys.join(", ")}</span>
            </span>
          )}
          {connector.referencedEnvVars.length > 0 && (
            <span>
              {labels.referencedEnvVars}:{" "}
              <span className="font-mono text-gray-400">
                {connector.referencedEnvVars.join(", ")}
              </span>
            </span>
          )}
        </div>
      )}

      {connector.tools.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {labels.tools}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {connector.tools.map((tool) => (
              <span
                key={tool.tool}
                className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border border-border bg-surface-2 text-gray-300"
              >
                <span className="font-mono">{tool.tool}</span>
                <span className="tabular-nums text-gray-500">{tool.calls}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The memory repository's layered layout, drawn as a stack.
 *
 * @param props - The architecture and its translated labels.
 */
function MemoryPanel({
  memory,
  labels,
}: {
  memory: CodexMemoryArchitecture;
  labels: {
    root: string;
    lessons: string;
    decisions: string;
    files: string;
    size: string;
    layers: string;
    purpose: string;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
          <span>
            {labels.root}: <span className="font-mono text-gray-300">{memory.root}</span>
          </span>
          <span>
            {labels.lessons}: <span className="text-gray-200">{memory.lessons}</span>
          </span>
          <span>
            {labels.decisions}: <span className="text-gray-200">{memory.decisions}</span>
          </span>
          <span>
            {labels.files}: <span className="text-gray-200">{memory.totals.files}</span>
          </span>
          <span>
            {labels.size}: <span className="text-gray-200">{formatBytes(memory.totals.bytes)}</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {memory.layers.map((layer) => (
          <div key={layer.key} className={`card p-4 ${layer.exists ? "" : "opacity-50"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-3">
                <Layers className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-100">
                    {layer.label}
                    <span className="ml-2 text-[11px] font-normal text-gray-500">{layer.dir}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">{layer.description}</p>
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px] text-gray-500 tabular-nums">
                <div>
                  {labels.files}: {layer.files}
                </div>
                <div>{formatBytes(layer.bytes)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * One guideline document, rendered from the parsed blocks.
 *
 * @param props - The document and its scope label.
 */
function GuidelinePanel({ doc, scopeLabel }: { doc: CodexGuideline; scopeLabel: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-sm font-medium text-gray-100">{doc.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-600 text-gray-400">
              {scopeLabel}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 font-mono break-all">{doc.path}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-xs leading-relaxed text-gray-300">
        {doc.blocks.map((block, index) => {
          if (block.type === "heading") {
            return (
              <p
                key={index}
                className={`font-semibold text-gray-100 ${
                  (block.level ?? 2) <= 2 ? "text-sm mt-3" : "text-xs mt-2"
                }`}
              >
                {block.text}
              </p>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={index} className="list-disc pl-4 space-y-0.5 text-gray-400">
                {(block.items ?? []).map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="text-gray-400">
              {block.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The Codex ecosystem page: skills, plugins, connectors, memory, and guidelines.
 */
export function CodexEcosystem() {
  const { t } = useTranslation("codexEcosystem");
  const [snapshot, setSnapshot] = useState<CodexEcosystemSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("skills");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | CodexSkillSource>("all");

  const load = useCallback(async (force: boolean) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = force ? await api.codexEcosystem.refresh() : await api.codexEcosystem.get();
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const sourceLabels: Record<CodexSkillSource, string> = {
    system: t("skills.sourceSystem"),
    plugin: t("skills.sourcePlugin"),
    user: t("skills.sourceUser"),
  };

  const filteredSkills = useMemo(() => {
    const items = snapshot?.skills ?? [];
    const needle = query.trim().toLowerCase();
    return items.filter((skill) => {
      if (sourceFilter !== "all" && skill.source !== sourceFilter) return false;
      if (!needle) return true;
      return (
        skill.name.toLowerCase().includes(needle) ||
        skill.description.toLowerCase().includes(needle)
      );
    });
  }, [snapshot, query, sourceFilter]);

  const summary = snapshot?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-50 tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-400">{t("subtitle")}</p>
          {snapshot && (
            <p className="mt-1 text-[11px] text-gray-500">
              {t("generatedAt")} {new Date(snapshot.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="btn-ghost disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? t("refreshing") : t("refresh")}
        </button>
      </div>

      {error && (
        <div className="card border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              [summary.skills, t("summary.skills"), Sparkles],
              [summary.plugins, t("summary.plugins"), Package],
              [summary.connectors, t("summary.connectors"), Plug],
              [summary.connectorCalls, t("summary.connectorCalls"), Cpu],
              [summary.skillReads, t("summary.skillReads"), Blocks],
              [summary.memoryLayers, t("summary.memoryLayers"), Brain],
            ] as const
          ).map(([value, label, Icon]) => (
            <div key={label} className="card p-3" aria-label={`${value} ${label}`}>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] truncate">{label}</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-50 tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-surface-2 border border-border">
        {TABS.map((key) => {
          const Icon = TAB_ICONS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                tab === key ? "bg-surface-4 text-gray-100" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(`tabs.${key}`)}
            </button>
          );
        })}
      </div>

      {loading && <CardSkeleton />}

      {!loading && snapshot && tab === "skills" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("skills.search")}
                className="input pl-9 w-full"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-border">
              {(["all", "system", "plugin", "user"] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSourceFilter(source)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    sourceFilter === source
                      ? "bg-surface-4 text-gray-200"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {source === "all" ? t("skills.allSources") : sourceLabels[source]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-500">{t("skills.usageNote")}</p>

          {filteredSkills.length === 0 ? (
            <EmptyState icon={Sparkles} title={t("skills.empty")} description="" />
          ) : (
            <div className="card overflow-hidden">
              <ul className="divide-y divide-border">
                {filteredSkills.map((skill) => (
                  <SkillRow
                    key={`${skill.source}:${skill.name}`}
                    skill={skill}
                    callsLabel={t("skills.calls", { count: skill.calls })}
                    filesLabel={t("skills.files", { count: skill.files.total })}
                    scriptsLabel={t("skills.scripts", { count: skill.files.scripts })}
                    sourceLabels={sourceLabels}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!loading && snapshot && tab === "plugins" && (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-500">{t("plugins.usageNote")}</p>
          {snapshot.plugins.length === 0 ? (
            <EmptyState icon={Package} title={t("plugins.empty")} description="" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {snapshot.plugins.map((plugin) => (
                <PluginCard
                  key={`${plugin.vendor}/${plugin.name}`}
                  plugin={plugin}
                  versionLabel={t("plugins.version")}
                  versionsLabel={t("plugins.versions")}
                  skillsLabel={t("plugins.skillsLabel", { count: plugin.skills.length })}
                  callsLabel={t("plugins.calls", { count: plugin.calls })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && snapshot && tab === "connectors" && (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-500">{t("connectors.secretNote")}</p>
          {snapshot.connectors.length === 0 ? (
            <EmptyState icon={Plug} title={t("connectors.empty")} description="" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {snapshot.connectors.map((connector) => (
                <ConnectorCard
                  key={connector.name}
                  connector={connector}
                  labels={{
                    transport: t("connectors.transport"),
                    http: t("connectors.http"),
                    stdio: t("connectors.stdio"),
                    url: t("connectors.url"),
                    command: t("connectors.command"),
                    envKeys: t("connectors.envKeys"),
                    referencedEnvVars: t("connectors.referencedEnvVars"),
                    useCase: t("connectors.useCase"),
                    tools: t("connectors.tools"),
                    calls: t("connectors.calls"),
                    noCalls: t("connectors.noCalls"),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && snapshot && tab === "memory" && (
        <MemoryPanel
          memory={snapshot.memory as CodexMemoryArchitecture}
          labels={{
            root: t("memory.root"),
            lessons: t("memory.lessons"),
            decisions: t("memory.decisions"),
            files: t("memory.files"),
            size: t("memory.size"),
            layers: t("memory.layers"),
            purpose: t("memory.purpose"),
          }}
        />
      )}

      {!loading && snapshot && tab === "guidelines" && (
        <div className="space-y-3">
          {snapshot.guidelines.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("guidelines.empty")}
              description={t("guidelines.hint")}
            />
          ) : (
            snapshot.guidelines.map((doc) => (
              <GuidelinePanel
                key={doc.path}
                doc={doc}
                scopeLabel={
                  doc.scope === "global"
                    ? t("guidelines.scopeGlobal")
                    : t("guidelines.scopeWorkspace")
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
