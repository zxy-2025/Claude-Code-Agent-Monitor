/**
 * @file CodexEcosystem.test.tsx
 * @description Behavioral regression suite for the Codex ecosystem page.
 *
 * The page projects a server snapshot into five tabs. These cases pin the
 * contracts that would break silently: the headline counts, the per-tab
 * content, the call counters, and the visible failure path.
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
 * **Module:** client/src/pages/__tests__/CodexEcosystem.test.tsx
 * **Area:** client test
 * **Responsibility:**
 * Behavioral regression suite for the Codex ecosystem page. The page projects a server snapshot
 * into five tabs. These cases pin the contracts that would break silently: the headline counts, the
 * per-tab content, the call counters, and the visible failure path.
 *
 * ## Architectural boundary
 * - Protects an observable client contract using Vitest and, for UI, Testing Library semantics.
 * - The test should fail for a meaningful production regression, not for harmless implementation
 *   rearrangement.
 * - Mocks isolate unavailable boundaries; they should not replace the behavior that the test claims
 *   to prove.
 *
 * ## Local dependency edges
 * - `../../lib/api` — repository-local contract consumed by this module; review its exports before
 *   changing assumptions here.
 * - `../../lib/types` — repository-local contract consumed by this module; review its exports
 *   before changing assumptions here.
 * - `../CodexEcosystem` — repository-local contract consumed by this module; review its exports
 *   before changing assumptions here.
 *
 * ## Package dependency edges
 * - `@testing-library/react` — external package boundary; keep usage within the installed version
 *   and the repository's existing adapter patterns.
 * - `@testing-library/user-event` — external package boundary; keep usage within the installed
 *   version and the repository's existing adapter patterns.
 * - `vitest` — external package boundary; keep usage within the installed version and the
 *   repository's existing adapter patterns.
 *
 * ## Top-level implementation landmarks
 * - `SNAPSHOT` (variable) — top-level declaration that helps orient code review and focused test
 *   selection.
 *
 * ## Named test contracts
 * - `Codex ecosystem page` — executable behavior named by this suite; preserve the observable
 *   contract or update the test with rationale.
 * - `filters the skill list by origin` — executable behavior named by this suite; preserve the
 *   observable contract or update the test with rationale.
 * - `lists every installed skill with its use case and call count` — executable behavior named by
 *   this suite; preserve the observable contract or update the test with rationale.
 * - `renders the guideline documents as headings and lists` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `renders the memory architecture layers and totals` — executable behavior named by this suite;
 *   preserve the observable contract or update the test with rationale.
 * - `shows a load failure instead of an empty page` — executable behavior named by this suite;
 *   preserve the observable contract or update the test with rationale.
 * - `shows connector endpoints, use cases, and per-tool counts` — executable behavior named by this
 *   suite; preserve the observable contract or update the test with rationale.
 * - `shows the headline counts from the snapshot` — executable behavior named by this suite;
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
 *   `node scripts/maintain-typescript-docs.ts --check client/src/pages/__tests__/CodexEcosystem.test.tsx`
 *   .
 * - Prove existing-file edits are comments/trivia only with
 *   `node scripts/verify-typescript-comment-only.ts origin/master` .
 * - Review the regenerated diff: generated structure is evidence, not a substitute for
 *   understanding runtime behavior.
 *
 * GENERATED_MAINTAINER_REFERENCE:END
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../lib/api";
import type { CodexEcosystemSnapshot } from "../../lib/types";
import { CodexEcosystem } from "../CodexEcosystem";

vi.mock("../../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api")>();
  return {
    ...actual,
    api: {
      ...actual.api,
      codexEcosystem: {
        get: vi.fn(),
        refresh: vi.fn(),
      },
    },
  };
});

/** A snapshot shaped like the server response, with one entry per tab. */
const SNAPSHOT: CodexEcosystemSnapshot = {
  generatedAt: "2026-11-27T00:00:00.000Z",
  codexHome: "/home/tester/.codex",
  memoryRoot: "/home/tester/memory",
  summary: {
    skills: 3,
    skillsSystem: 1,
    skillsPlugin: 1,
    skillsUser: 1,
    plugins: 2,
    connectors: 2,
    connectorCalls: 7,
    skillReads: 5,
    memoryLayers: 7,
    guidelineDocuments: 2,
  },
  skills: [
    {
      name: "alpha-skill",
      description: "Does alpha things.",
      source: "user",
      plugin: null,
      path: "/home/tester/.codex/skills/alpha-skill",
      files: { total: 3, scripts: 1, references: 2 },
      calls: 5,
    },
    {
      name: "beta-skill",
      description: "Does beta things.",
      source: "system",
      plugin: null,
      path: "/home/tester/.codex/skills/.system/beta-skill",
      files: { total: 1, scripts: 0, references: 1 },
      calls: 0,
    },
    {
      name: "gamma-skill",
      description: "Ships with a plugin.",
      source: "plugin",
      plugin: "browser",
      path: "/home/tester/.codex/plugins/cache/browser/1.0/skills/gamma-skill",
      files: { total: 2, scripts: 0, references: 1 },
      calls: 2,
    },
  ],
  plugins: [
    {
      name: "browser",
      vendor: "openai-bundled",
      versions: ["1.0", "2.0"],
      version: "2.0",
      skills: ["gamma-skill"],
      path: "/home/tester/.codex/plugins/cache/browser",
      calls: 2,
    },
    {
      name: "visualize",
      vendor: "openai-bundled",
      versions: ["3.0"],
      version: "3.0",
      skills: [],
      path: "/home/tester/.codex/plugins/cache/visualize",
      calls: 0,
    },
  ],
  connectors: [
    {
      name: "demo-connector",
      transport: "http",
      url: "https://demo.test/mcp",
      command: null,
      args: [],
      envKeys: ["DEMO_TOKEN"],
      referencedEnvVars: ["DEMO_KEY"],
      useCases: ["Drive the demo browser."],
      tools: [{ tool: "search", calls: 7 }],
      calls: 7,
    },
    {
      name: "local-connector",
      transport: "stdio",
      url: null,
      command: "node",
      args: ["server.js"],
      envKeys: [],
      referencedEnvVars: [],
      useCases: [],
      tools: [],
      calls: 0,
    },
  ],
  memory: {
    root: "/home/tester/memory",
    layers: [
      {
        key: "hot",
        label: "HOT",
        dir: "memory/hot",
        description: "Current state snapshots.",
        files: 2,
        bytes: 1024,
        exists: true,
      },
      {
        key: "cold",
        label: "COLD",
        dir: "MEMORY.md",
        description: "Long-term lessons.",
        files: 1,
        bytes: 2048,
        exists: true,
      },
    ],
    totals: { files: 3, bytes: 3072 },
    lessons: 115,
    decisions: 7,
    hasAgents: true,
  },
  guidelines: [
    {
      scope: "global",
      title: "Global Guidelines",
      path: "/home/tester/.codex/AGENTS.md",
      characters: 120,
      blocks: [
        { type: "heading", level: 1, text: "Global" },
        { type: "list", items: ["Prefer Chrome", "Never upload data"] },
      ],
    },
  ],
};

beforeEach(() => {
  vi.mocked(api.codexEcosystem.get).mockReset().mockResolvedValue(SNAPSHOT);
  vi.mocked(api.codexEcosystem.refresh).mockReset().mockResolvedValue(SNAPSHOT);
});

describe("Codex ecosystem page", () => {
  it("shows the headline counts from the snapshot", async () => {
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    expect(screen.getByLabelText("7 Connector calls")).toBeTruthy();
    expect(screen.getByLabelText("5 Skill reads")).toBeTruthy();
    expect(screen.getByLabelText("3 Skills")).toBeTruthy();
  });

  it("lists every installed skill with its use case and call count", async () => {
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    expect(screen.getByText("Does alpha things.")).toBeTruthy();
    expect(screen.getByText("beta-skill")).toBeTruthy();
    expect(screen.getByText("gamma-skill")).toBeTruthy();
  });

  it("filters the skill list by origin", async () => {
    const user = userEvent.setup();
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: /built-in/i }));
    expect(screen.queryByText("alpha-skill")).toBeNull();
    expect(screen.getByText("beta-skill")).toBeTruthy();
  });

  it("shows connector endpoints, use cases, and per-tool counts", async () => {
    const user = userEvent.setup();
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: /connectors/i }));
    expect(screen.getByText("https://demo.test/mcp")).toBeTruthy();
    expect(screen.getByText("Drive the demo browser.")).toBeTruthy();
    expect(screen.getByText("search")).toBeTruthy();
  });

  it("renders the memory architecture layers and totals", async () => {
    const user = userEvent.setup();
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: /memory architecture/i }));
    expect(screen.getByText("HOT")).toBeTruthy();
    expect(screen.getByText("COLD")).toBeTruthy();
    expect(screen.getByText("115")).toBeTruthy();
  });

  it("renders the guideline documents as headings and lists", async () => {
    const user = userEvent.setup();
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("alpha-skill")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: /workspace guidelines/i }));
    expect(screen.getByText("Global Guidelines")).toBeTruthy();
    expect(screen.getByText("Prefer Chrome")).toBeTruthy();
  });

  it("shows a load failure instead of an empty page", async () => {
    vi.mocked(api.codexEcosystem.get).mockRejectedValue(new Error("collection failed"));
    render(<CodexEcosystem />);
    await waitFor(() => expect(screen.getByText("collection failed")).toBeTruthy());
  });
});
