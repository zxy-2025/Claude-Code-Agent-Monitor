/**
 * @file Collects a snapshot of the local Codex environment for the dashboard.
 *
 * The dashboard shows what Codex can reach on this machine: the installed
 * skills, the bundled plugins, the configured MCP connectors, the memory
 * architecture, and the workspace guideline files. Everything is read from the
 * local filesystem and the Codex state databases - nothing is sent anywhere.
 *
 * Two rules shape the implementation:
 *
 * 1. **Secrets never leave the machine.** Connector environment *values* are
 *    not exposed. Only key names are listed, plus the human-readable use-case
 *    hints that Codex itself stores in dedicated `*_INSTRUCTIONS_USE_CASE_*`
 *    and `*_TOOL_OVERRIDES` variables.
 * 2. **Counts are labelled by their definition.** Connector and tool counts
 *    come from recorded tool calls and are exact. Skill and plugin counts
 *    count the reads of that skill's `SKILL.md`, which is how a skill is
 *    activated; the dashboard labels them accordingly instead of pretending
 *    they are first-party telemetry.
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { getCodexHome } = require("./codex-home");

/** How long a collected snapshot stays fresh, in milliseconds. */
const SNAPSHOT_TTL_MS = 60_000;

/** Cached snapshot plus the timestamp it was collected at. */
let cachedSnapshot = null;
let cachedAt = 0;

/**
 * Environment variable names whose *value* is a human-readable description
 * rather than a credential. Everything else is reported by name only.
 */
const USE_CASE_KEY_PATTERN = /(_INSTRUCTIONS_USE_CASE_|_INSTRUCTIONS$|SERVER_INSTRUCTIONS)/i;

/**
 * Parse the subset of TOML that `config.toml` uses for MCP servers: tables,
 * dotted table headers, and `key = value` pairs with strings, numbers,
 * booleans, and single-line arrays.
 *
 * @param {string} text - Raw TOML source.
 * @returns {Map<string, object>} Flattened key path -> value map.
 */
function parseSimpleToml(text) {
  const out = new Map();
  let table = "";
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      table = header[1].trim();
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!pair) continue;
    const key = pair[1].trim();
    const raw = pair[2].trim();
    out.set(table ? `${table}.${key}` : key, parseTomlValue(raw));
  }
  return out;
}

/**
 * Convert a raw TOML scalar into a JavaScript value.
 *
 * @param {string} raw - Right-hand side of an assignment.
 * @returns {unknown} The parsed value.
 */
function parseTomlValue(raw) {
  const text = raw.replace(/\s+#.*$/, "").trim();
  if (text.startsWith('"""') || text.startsWith("'''")) {
    return text.slice(3, -3);
  }
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1);
  }
  if (text.startsWith("[")) {
    const inner = text.slice(1, text.lastIndexOf("]"));
    if (!inner.trim()) return [];
    return inner.split(",").map((item) => parseTomlValue(item.trim()));
  }
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+$/.test(text)) return Number.parseInt(text, 10);
  if (/^-?\d*\.\d+$/.test(text)) return Number.parseFloat(text);
  return text;
}

/**
 * Read the `name` and `description` fields from a SKILL.md frontmatter block.
 *
 * @param {string} text - Full SKILL.md contents.
 * @returns {{ name: string, description: string }} The parsed frontmatter.
 */
function parseSkillFrontmatter(text) {
  const result = { name: "", description: "" };
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return result;
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!pair) continue;
    const value = pair[2].trim().replace(/^["']|["']$/g, "");
    if (pair[1] === "name") result.name = value;
    if (pair[1] === "description") result.description = value;
  }
  return result;
}

/**
 * List every directory that contains a SKILL.md, relative to a base directory.
 *
 * @param {string} base - Directory to search.
 * @param {number} depth - How many levels to descend.
 * @returns {Array<{ dir: string, skillFile: string }>} Discovered skills.
 */
function findSkillDirs(base, depth) {
  const found = [];
  const walk = (dir, level) => {
    if (level > depth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      const full = path.join(dir, entry.name);
      const skillFile = path.join(full, "SKILL.md");
      if (fs.existsSync(skillFile)) {
        found.push({ dir: full, skillFile });
        continue;
      }
      walk(full, level + 1);
    }
  };
  walk(base, 0);
  return found;
}

/**
 * Count the files inside a skill directory, by kind.
 *
 * @param {string} dir - Skill directory.
 * @returns {{ total: number, scripts: number, references: number }} File tallies.
 */
function countSkillFiles(dir) {
  const tally = { total: 0, scripts: 0, references: 0 };
  const walk = (current) => {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(current, entry.name));
      } else {
        tally.total += 1;
        if (entry.name.endsWith(".py") || entry.name.endsWith(".sh")) tally.scripts += 1;
        if (entry.name.endsWith(".md")) tally.references += 1;
      }
    }
  };
  walk(dir);
  return tally;
}

/**
 * Locate the Codex memory repository, if one is configured or discoverable.
 *
 * @returns {string|null} The memory root, or null when it cannot be found.
 */
function findMemoryRoot() {
  const explicit = process.env.DASHBOARD_CODEX_MEMORY_ROOT;
  if (explicit && fs.existsSync(explicit)) return explicit;

  const anchors = [
    path.dirname(getCodexHome()),
    path.resolve(__dirname, "..", ".."),
    path.resolve(__dirname, "..", "..", ".."),
    process.cwd(),
  ];

  for (const anchor of anchors) {
    let current = path.resolve(anchor);
    for (let level = 0; level < 6; level += 1) {
      const hit = findMemoryDirBeside(current);
      if (hit) return hit;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

/**
 * Find a Codex memory repository sitting next to a directory.
 *
 * @param {string} dir - Directory to inspect.
 * @returns {string|null} The memory repository, or null.
 */
function findMemoryDirBeside(dir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!/Codex_memory$/i.test(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (fs.existsSync(path.join(full, "MEMORY.md"))) return full;
  }
  return null;
}

/**
 * Describe the memory repository's layered layout.
 *
 * @param {string} root - Memory repository root.
 * @returns {object|null} Layer description, or null when the root is missing.
 */
function collectMemoryArchitecture(root) {
  if (!root || !fs.existsSync(root)) return null;

  const layers = [
    { key: "hot", label: "HOT", dir: "memory/hot", description: "当前状态快照与实时会话跟踪" },
    {
      key: "warm",
      label: "WARM",
      dir: "memory/warm",
      description: "偏好、纠正、项目与外部指针（暖记忆）",
    },
    { key: "cold", label: "COLD", dir: "MEMORY.md", description: "长期教训、已验证结论与永久决策" },
    { key: "summary", label: "SUMMARY", dir: "memory/summary", description: "每日结构化摘要" },
    {
      key: "decisions",
      label: "DECISIONS",
      dir: "memory/decisions",
      description: "已确认结论（后续依赖）",
    },
    {
      key: "lessons",
      label: "LESSONS",
      dir: "memory/lessons",
      description: "已知教训（防重复犯错）",
    },
    {
      key: "learnings",
      label: "LEARNINGS",
      dir: ".learnings",
      description: "错误、纠正、确认与功能缺口",
    },
  ];

  const described = [];
  let totalFiles = 0;
  let totalBytes = 0;

  for (const layer of layers) {
    const full = path.join(root, layer.dir);
    let files = 0;
    let bytes = 0;
    const walk = (current) => {
      let entries = [];
      try {
        entries = fs.readdirSync(current, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const child = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(child);
        } else {
          files += 1;
          try {
            bytes += fs.statSync(child).size;
          } catch {
            /* unreadable file still counts */
          }
        }
      }
    };
    if (fs.existsSync(full)) walk(full);
    totalFiles += files;
    totalBytes += bytes;
    described.push({ ...layer, files, bytes, exists: fs.existsSync(full) });
  }

  const memoryFile = path.join(root, "MEMORY.md");
  let lessons = 0;
  let decisions = 0;
  try {
    const text = fs.readFileSync(memoryFile, "utf8");
    const numbered = text.match(/^\s*[-*]\s*\*\*(\d+)\*\*/gm) || [];
    lessons = numbered.length;
    decisions = (text.match(/^\|\s*20\d\d-\d\d-\d\d\s*\|/gm) || []).length;
  } catch {
    /* memory file missing - counts stay zero */
  }

  return {
    root,
    layers: described,
    totals: { files: totalFiles, bytes: totalBytes },
    lessons,
    decisions,
    hasAgents: fs.existsSync(path.join(root, "AGENTS.md")),
  };
}

/**
 * Parse a Markdown file into simple renderable blocks.
 *
 * The dashboard has no Markdown renderer, so the guidelines are converted into
 * a small block list the client can render directly.
 *
 * @param {string} text - Markdown source.
 * @returns {Array<object>} Block list.
 */
function parseMarkdownBlocks(text) {
  const blocks = [];
  const lines = String(text).split(/\r?\n/);
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
      continue;
    }
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      list.push(ordered[1].trim());
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return blocks;
}

/**
 * Collect the guideline files that steer Codex in this workspace.
 *
 * @param {string} codexHome - Codex home directory.
 * @param {string|null} memoryRoot - Memory repository root.
 * @returns {Array<object>} Guideline documents.
 */
function collectGuidelines(codexHome, memoryRoot) {
  const docs = [];
  const sources = [
    { scope: "global", title: "全局工作约定", file: path.join(codexHome, "AGENTS.md") },
    { scope: "global", title: "全局记忆指针", file: path.join(codexHome, "memories", "AGENTS.md") },
  ];
  if (memoryRoot) {
    sources.push({
      scope: "workspace",
      title: "Codex 记忆系统工作准则",
      file: path.join(memoryRoot, "AGENTS.md"),
    });
  }

  for (const source of sources) {
    if (!fs.existsSync(source.file)) continue;
    let text = "";
    try {
      text = fs.readFileSync(source.file, "utf8");
    } catch {
      continue;
    }
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const blocks = parseMarkdownBlocks(text);
    docs.push({
      scope: source.scope,
      title: source.title,
      path: source.file,
      characters: text.length,
      blocks,
    });
  }
  return docs;
}

/**
 * Locate the Codex thread-history database that records tool calls.
 *
 * @param {string} codexHome - Codex home directory.
 * @returns {string|null} Database path, or null when absent.
 */
function findThreadHistoryDb(codexHome) {
  try {
    const candidates = fs
      .readdirSync(codexHome)
      .filter((name) => /^thread_history_\d+\.sqlite$/.test(name))
      .sort((left, right) => Number(right.match(/\d+/)[0]) - Number(left.match(/\d+/)[0]));
    return candidates.length ? path.join(codexHome, candidates[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Count tool calls per connector and per tool, and skill reads per skill.
 *
 * @param {string} codexHome - Codex home directory.
 * @returns {{ connectors: object, tools: object, skills: object, plugins: object, totals: object }} Usage tallies.
 */
function collectUsage(codexHome) {
  const usage = {
    connectors: {},
    tools: {},
    skills: {},
    plugins: {},
    totals: { connectorCalls: 0, toolCalls: 0, skillReads: 0, sampledItems: 0 },
  };

  const dbPath = findThreadHistoryDb(codexHome);
  if (!dbPath) return usage;

  // The Codex state database lives outside this project, so it is read with
  // whichever driver is available: the native better-sqlite3 when installed,
  // otherwise the project's node:sqlite compatibility shim.
  let Database;
  try {
    Database = require("better-sqlite3");
  } catch {
    try {
      Database = require("../compat-sqlite");
    } catch {
      return usage;
    }
  }

  let sqlite;
  try {
    sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  } catch {
    return usage;
  }

  // Commands reference skill folders with either separator, and the skill name is
  // the directory that holds SKILL.md - `.system` skills nest one level deeper.
  const skillPattern = /[\\/]skills[\\/](.+?)[\\/]SKILL\.md/gi;
  const pluginPattern = /[\\/]plugins[\\/]cache[\\/]([^\\/]+)[\\/]([^\\/]+)/gi;

  try {
    const rows = sqlite.prepare("SELECT item_type, item_json FROM thread_items").all();
    usage.totals.sampledItems = rows.length;

    for (const row of rows) {
      let item;
      try {
        item = JSON.parse(row.item_json);
      } catch {
        continue;
      }

      if (row.item_type === "mcpToolCall") {
        const server = String(item.server || "unknown");
        const tool = String(item.tool || "unknown");
        usage.connectors[server] = (usage.connectors[server] || 0) + 1;
        const toolKey = `${server}.${tool}`;
        usage.tools[toolKey] = (usage.tools[toolKey] || 0) + 1;
        usage.totals.connectorCalls += 1;
        usage.totals.toolCalls += 1;
        continue;
      }

      if (row.item_type !== "commandExecution") continue;
      const command = String(item.command || "").toLowerCase();

      for (const match of command.matchAll(skillPattern)) {
        const segments = match[1].split(/[\\/]/).filter(Boolean);
        const name = segments[segments.length - 1];
        if (!name) continue;
        usage.skills[name] = (usage.skills[name] || 0) + 1;
        usage.totals.skillReads += 1;
      }
      for (const match of command.matchAll(pluginPattern)) {
        const plugin = match[2];
        if (!plugin) continue;
        usage.plugins[plugin] = (usage.plugins[plugin] || 0) + 1;
      }
    }
  } catch {
    /* a partially readable database still yields whatever was counted so far */
  } finally {
    sqlite.close();
  }

  return usage;
}

/**
 * List the installed versions of a plugin.
 *
 * @param {string} pluginDir - Plugin directory.
 * @returns {string[]} Version directory names, oldest first.
 */
function listPluginVersions(pluginDir) {
  try {
    return fs
      .readdirSync(pluginDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "skills")
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Collect the skills a plugin ships, across every installed version.
 *
 * The cache layout is `<plugin>/<version>/skills/<skill>/SKILL.md`, so the
 * version level must be walked before the skill folders are discovered.
 *
 * @param {string} pluginDir - Plugin directory.
 * @returns {Array<{ dir: string, skillFile: string, version: string }>} Discovered skills.
 */
function listPluginSkills(pluginDir) {
  const found = [];
  for (const version of listPluginVersions(pluginDir)) {
    for (const entry of findSkillDirs(path.join(pluginDir, version, "skills"), 2)) {
      found.push({ ...entry, version });
    }
  }
  return found;
}

/**
 * Collect the installed skills, grouped by where they came from.
 *
 * @param {string} codexHome - Codex home directory.
 * @param {object} usage - Usage tallies from {@link collectUsage}.
 * @returns {Array<object>} Skill descriptors.
 */
function collectSkills(codexHome, usage) {
  const skills = [];
  const skillsRoot = path.join(codexHome, "skills");
  const pluginsRoot = path.join(codexHome, "plugins", "cache");

  const record = (entry, source, pluginName) => {
    let frontmatter = { name: "", description: "" };
    try {
      frontmatter = parseSkillFrontmatter(fs.readFileSync(entry.skillFile, "utf8"));
    } catch {
      /* unreadable skill file still shows up in the list */
    }
    const name = frontmatter.name || path.basename(entry.dir);
    skills.push({
      name,
      description: frontmatter.description,
      source,
      plugin: pluginName || null,
      path: entry.dir,
      files: countSkillFiles(entry.dir),
      calls: usage.skills[name] || 0,
    });
  };

  for (const entry of findSkillDirs(skillsRoot, 2)) {
    const relative = path.relative(skillsRoot, entry.dir).split(path.sep);
    const source = relative[0] === ".system" ? "system" : "user";
    record(entry, source, null);
  }

  let vendors = [];
  try {
    vendors = fs.readdirSync(pluginsRoot, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    vendors = [];
  }
  for (const vendor of vendors) {
    const vendorDir = path.join(pluginsRoot, vendor.name);
    let plugins = [];
    try {
      plugins = fs.readdirSync(vendorDir, { withFileTypes: true }).filter((e) => e.isDirectory());
    } catch {
      plugins = [];
    }
    for (const plugin of plugins) {
      const pluginDir = path.join(vendorDir, plugin.name);
      for (const entry of listPluginSkills(pluginDir)) {
        record(entry, "plugin", plugin.name);
      }
    }
  }

  skills.sort((left, right) => right.calls - left.calls || left.name.localeCompare(right.name));
  return skills;
}

/**
 * Collect the bundled plugin cache.
 *
 * @param {string} codexHome - Codex home directory.
 * @param {object} usage - Usage tallies from {@link collectUsage}.
 * @returns {Array<object>} Plugin descriptors.
 */
function collectPlugins(codexHome, usage) {
  const plugins = [];
  const pluginsRoot = path.join(codexHome, "plugins", "cache");
  let vendors = [];
  try {
    vendors = fs.readdirSync(pluginsRoot, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    vendors = [];
  }

  for (const vendor of vendors) {
    const vendorDir = path.join(pluginsRoot, vendor.name);
    let entries = [];
    try {
      entries = fs.readdirSync(vendorDir, { withFileTypes: true }).filter((e) => e.isDirectory());
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      const pluginDir = path.join(vendorDir, entry.name);
      const versions = listPluginVersions(pluginDir);
      const skillNames = listPluginSkills(pluginDir).map((skill) => path.basename(skill.dir));
      plugins.push({
        name: entry.name,
        vendor: vendor.name,
        versions,
        version: versions[versions.length - 1] || null,
        skills: skillNames,
        path: pluginDir,
        calls: usage.plugins[entry.name] || 0,
      });
    }
  }

  plugins.sort((left, right) => right.calls - left.calls || left.name.localeCompare(right.name));
  return plugins;
}

/**
 * Collect the MCP connectors configured in `config.toml`.
 *
 * Connector environment values are never exposed; only names, plus the
 * human-readable use-case hints Codex stores in dedicated variables.
 *
 * @param {string} codexHome - Codex home directory.
 * @param {object} usage - Usage tallies from {@link collectUsage}.
 * @returns {Array<object>} Connector descriptors.
 */
function collectConnectors(codexHome, usage) {
  const configPath = path.join(codexHome, "config.toml");
  let raw = "";
  try {
    raw = fs.readFileSync(configPath, "utf8");
  } catch {
    return [];
  }

  const toml = parseSimpleToml(raw);
  const names = new Set();
  for (const key of toml.keys()) {
    const match = key.match(/^mcp_servers\.([^.]+)/);
    if (match) names.add(match[1]);
  }

  const connectors = [];
  for (const name of names) {
    const prefix = `mcp_servers.${name}`;
    const url = toml.get(`${prefix}.url`);
    const command = toml.get(`${prefix}.command`);
    const args = toml.get(`${prefix}.args`);
    const envKeys = [];
    const useCases = [];

    for (const [key, value] of toml.entries()) {
      if (!key.startsWith(`${prefix}.env.`)) continue;
      const envKey = key.slice(`${prefix}.env.`.length);
      envKeys.push(envKey);
      if (USE_CASE_KEY_PATTERN.test(envKey) && typeof value === "string") {
        useCases.push(value);
        continue;
      }
      if (/TOOL_OVERRIDES$/.test(envKey) && typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed.server_instructions === "string") {
            useCases.push(parsed.server_instructions);
          }
        } catch {
          /* not JSON - ignore */
        }
      }
    }

    const envVarNames = toml.get(`${prefix}.env_vars`);
    const bearerEnv = toml.get(`${prefix}.bearer_token_env_var`);
    const referenced = [];
    if (Array.isArray(envVarNames)) referenced.push(...envVarNames);
    if (typeof bearerEnv === "string") referenced.push(bearerEnv);

    const toolCalls = [];
    for (const [key, count] of Object.entries(usage.tools)) {
      const [server, tool] = key.split(".");
      if (server === name) toolCalls.push({ tool, calls: count });
    }
    toolCalls.sort((left, right) => right.calls - left.calls);

    connectors.push({
      name,
      transport: typeof url === "string" ? "http" : "stdio",
      url: typeof url === "string" ? url : null,
      command: typeof command === "string" ? command : null,
      args: Array.isArray(args) ? args : [],
      envKeys: envKeys.sort(),
      referencedEnvVars: referenced.sort(),
      useCases,
      tools: toolCalls,
      calls: usage.connectors[name] || 0,
    });
  }

  connectors.sort((left, right) => right.calls - left.calls || left.name.localeCompare(right.name));
  return connectors;
}

/**
 * Build the complete ecosystem snapshot.
 *
 * @returns {object} The snapshot.
 */
function buildSnapshot() {
  const codexHome = getCodexHome();
  const usage = collectUsage(codexHome);
  const memoryRoot = findMemoryRoot();

  const skills = collectSkills(codexHome, usage);
  const plugins = collectPlugins(codexHome, usage);
  const connectors = collectConnectors(codexHome, usage);
  const memory = collectMemoryArchitecture(memoryRoot);
  const guidelines = collectGuidelines(codexHome, memoryRoot);

  return {
    generatedAt: new Date().toISOString(),
    codexHome,
    memoryRoot,
    summary: {
      skills: skills.length,
      skillsSystem: skills.filter((skill) => skill.source === "system").length,
      skillsPlugin: skills.filter((skill) => skill.source === "plugin").length,
      skillsUser: skills.filter((skill) => skill.source === "user").length,
      plugins: plugins.length,
      connectors: connectors.length,
      connectorCalls: usage.totals.connectorCalls,
      skillReads: usage.totals.skillReads,
      memoryLayers: memory ? memory.layers.filter((layer) => layer.exists).length : 0,
      guidelineDocuments: guidelines.length,
    },
    skills,
    plugins,
    connectors,
    memory,
    guidelines,
  };
}

/**
 * Return the ecosystem snapshot, reusing a cached one while it is still fresh.
 *
 * @param {boolean} force - Ignore the cache and rebuild the snapshot.
 * @returns {object} The snapshot.
 */
function getEcosystemSnapshot(force) {
  const now = Date.now();
  if (!force && cachedSnapshot && now - cachedAt < SNAPSHOT_TTL_MS) {
    return cachedSnapshot;
  }
  cachedSnapshot = buildSnapshot();
  cachedAt = now;
  return cachedSnapshot;
}

module.exports = {
  collectConnectors,
  collectGuidelines,
  collectMemoryArchitecture,
  collectPlugins,
  collectSkills,
  collectUsage,
  getEcosystemSnapshot,
  parseSimpleToml,
  parseSkillFrontmatter,
};
