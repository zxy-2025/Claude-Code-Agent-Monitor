/**
 * @file Verifies the local Codex ecosystem collector.
 *
 * The collector reads the Codex home directory, so the tests point it at a
 * fixture tree instead of the real one. The security case matters most: a
 * connector's environment values must never reach the dashboard.
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, describe, it } = require("node:test");

const {
  collectConnectors,
  collectGuidelines,
  collectMemoryArchitecture,
  collectPlugins,
  collectSkills,
  parseSimpleToml,
  parseSkillFrontmatter,
} = require("../lib/codex-ecosystem");

/** Fixture root; the collector resolves the Codex home from the environment. */
let fixtureRoot;
let codexHome;
let memoryRoot;

before(() => {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ccam-eco-"));
  codexHome = path.join(fixtureRoot, ".codex");
  memoryRoot = path.join(fixtureRoot, "102_Codex_memory");

  fs.mkdirSync(path.join(codexHome, "skills", "demo-skill", "scripts"), { recursive: true });
  fs.writeFileSync(
    path.join(codexHome, "skills", "demo-skill", "SKILL.md"),
    "---\nname: demo-skill\ndescription: Demonstrates the skill contract.\n---\n\n# Demo\n"
  );
  fs.writeFileSync(path.join(codexHome, "skills", "demo-skill", "scripts", "run.py"), "# script\n");

  fs.mkdirSync(path.join(codexHome, "skills", ".system", "imagegen"), { recursive: true });
  fs.writeFileSync(
    path.join(codexHome, "skills", ".system", "imagegen", "SKILL.md"),
    "---\nname: imagegen\ndescription: Generates images.\n---\n"
  );

  const pluginDir = path.join(codexHome, "plugins", "cache", "openai-bundled", "browser", "1.2.3");
  fs.mkdirSync(path.join(pluginDir, "skills", "control-in-app-browser"), { recursive: true });
  fs.writeFileSync(
    path.join(pluginDir, "skills", "control-in-app-browser", "SKILL.md"),
    "---\nname: control-in-app-browser\ndescription: Drives the in-app browser.\n---\n"
  );

  fs.writeFileSync(
    path.join(codexHome, "config.toml"),
    [
      "[mcp_servers.demo]",
      'url = "https://example.test/mcp"',
      "",
      "[mcp_servers.demo.env]",
      'DEMO_TOKEN = "super-secret-value"',
      'DEMO_INSTRUCTIONS_USE_CASE_BROWSER = "Drive the demo browser."',
      "",
      "[mcp_servers.local]",
      'command = "node"',
      'args = ["server.js", "--flag"]',
      'env_vars = ["LOCAL_TOKEN"]',
      "",
    ].join("\n")
  );

  fs.mkdirSync(path.join(codexHome, "plugins", "cache", "openai-bundled", "visualize"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(memoryRoot, "memory", "hot"), { recursive: true });
  fs.mkdirSync(path.join(memoryRoot, "memory", "warm"), { recursive: true });
  fs.writeFileSync(path.join(memoryRoot, "MEMORY.md"), "- **1** first lesson\n");
  fs.writeFileSync(path.join(memoryRoot, "AGENTS.md"), "# Guidelines\n\n- rule one\n");
  fs.writeFileSync(path.join(codexHome, "AGENTS.md"), "# Global\n\n## Chrome\n- use Chrome\n");

  process.env.DASHBOARD_CODEX_HOME = codexHome;
  process.env.DASHBOARD_CODEX_MEMORY_ROOT = memoryRoot;
});

after(() => {
  delete process.env.DASHBOARD_CODEX_HOME;
  delete process.env.DASHBOARD_CODEX_MEMORY_ROOT;
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
});

describe("parseSimpleToml", () => {
  it("reads tables, dotted tables, and value kinds", () => {
    const parsed = parseSimpleToml(
      [
        "[mcp_servers.a]",
        'url = "https://a.test"',
        "count = 3",
        "enabled = true",
        'args = ["x", "y"]',
        "",
        "[mcp_servers.a.env]",
        'KEY = "value"',
      ].join("\n")
    );
    assert.equal(parsed.get("mcp_servers.a.url"), "https://a.test");
    assert.equal(parsed.get("mcp_servers.a.count"), 3);
    assert.equal(parsed.get("mcp_servers.a.enabled"), true);
    assert.deepEqual(parsed.get("mcp_servers.a.args"), ["x", "y"]);
    assert.equal(parsed.get("mcp_servers.a.env.KEY"), "value");
  });
});

describe("parseSkillFrontmatter", () => {
  it("reads name and description and tolerates a missing block", () => {
    const parsed = parseSkillFrontmatter("---\nname: alpha\ndescription: Does things.\n---\nbody");
    assert.equal(parsed.name, "alpha");
    assert.equal(parsed.description, "Does things.");
    assert.equal(parseSkillFrontmatter("no frontmatter").name, "");
  });
});

describe("collectSkills", () => {
  it("separates system, user, and plugin-provided skills", () => {
    const skills = collectSkills(codexHome, { skills: {}, plugins: {} });
    const byName = Object.fromEntries(skills.map((skill) => [skill.name, skill]));
    assert.equal(byName["demo-skill"].source, "user");
    assert.equal(byName["imagegen"].source, "system");
    assert.equal(byName["control-in-app-browser"].source, "plugin");
    assert.equal(byName["control-in-app-browser"].plugin, "browser");
    assert.equal(byName["demo-skill"].files.total, 2);
  });
});

describe("collectPlugins", () => {
  it("lists versions and the skills a plugin ships", () => {
    const plugins = collectPlugins(codexHome, { plugins: {} });
    const browser = plugins.find((plugin) => plugin.name === "browser");
    assert.ok(browser, "browser plugin should be discovered");
    assert.deepEqual(browser.versions, ["1.2.3"]);
    assert.deepEqual(browser.skills, ["control-in-app-browser"]);
  });
});

describe("collectConnectors", () => {
  const connectors = collectConnectors(codexHome, { connectors: {}, tools: {} });

  it("lists both http and stdio connectors", () => {
    const byName = Object.fromEntries(connectors.map((connector) => [connector.name, connector]));
    assert.equal(byName.demo.transport, "http");
    assert.equal(byName.demo.url, "https://example.test/mcp");
    assert.equal(byName.local.transport, "stdio");
    assert.equal(byName.local.command, "node");
    assert.deepEqual(byName.local.args, ["server.js", "--flag"]);
    assert.deepEqual(byName.local.referencedEnvVars, ["LOCAL_TOKEN"]);
  });

  it("never exposes environment values", () => {
    const serialized = JSON.stringify(connectors);
    assert.ok(!serialized.includes("super-secret-value"), "env values must not be exposed");
  });

  it("surfaces the use-case hint Codex stores for a connector", () => {
    const demo = connectors.find((connector) => connector.name === "demo");
    assert.ok(demo.envKeys.includes("DEMO_TOKEN"));
    assert.deepEqual(demo.useCases, ["Drive the demo browser."]);
  });
});

describe("collectMemoryArchitecture", () => {
  it("describes the layers and counts lessons", () => {
    const memory = collectMemoryArchitecture(memoryRoot);
    assert.ok(memory, "memory architecture should be found");
    assert.equal(memory.lessons, 1);
    assert.equal(memory.hasAgents, true);
    const hot = memory.layers.find((layer) => layer.key === "hot");
    assert.equal(hot.files, 0);
  });

  it("returns null for a missing repository", () => {
    assert.equal(collectMemoryArchitecture(path.join(fixtureRoot, "nope")), null);
  });
});

describe("collectGuidelines", () => {
  it("parses the guideline files into renderable blocks", () => {
    const guidelines = collectGuidelines(codexHome, memoryRoot);
    const titles = guidelines.map((doc) => doc.title);
    assert.ok(titles.includes("全局工作约定"));
    assert.ok(titles.includes("Codex 记忆系统工作准则"));
    const global = guidelines.find((doc) => doc.title === "全局工作约定");
    assert.ok(global.blocks.some((block) => block.type === "heading" && block.text === "Chrome"));
    assert.ok(
      global.blocks.some((block) => block.type === "list" && block.items.includes("use Chrome"))
    );
  });
});
