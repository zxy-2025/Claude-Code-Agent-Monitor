/**
 * @file OpenAPI fragment for the local Codex ecosystem endpoint.
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

const tags = [{ name: "Codex Ecosystem", description: "Local Codex environment inspection" }];

const schemas = {
  CodexEcosystemSummary: {
    type: "object",
    description: "Counts summarising the local Codex environment.",
    properties: {
      skills: { type: "integer", description: "Total installed skills." },
      skillsSystem: { type: "integer", description: "Skills bundled with Codex itself." },
      skillsPlugin: { type: "integer", description: "Skills shipped by bundled plugins." },
      skillsUser: { type: "integer", description: "Skills installed by the user." },
      plugins: { type: "integer", description: "Cached plugins." },
      connectors: { type: "integer", description: "Configured MCP connectors." },
      connectorCalls: { type: "integer", description: "Recorded MCP tool calls." },
      skillReads: { type: "integer", description: "Recorded reads of a skill's SKILL.md." },
      memoryLayers: { type: "integer", description: "Memory layers discovered." },
      guidelineDocuments: { type: "integer", description: "Guideline documents found." },
    },
  },
  CodexEcosystemSnapshot: {
    type: "object",
    description:
      "Snapshot of the Codex environment on this machine: skills, plugins, MCP connectors, the memory architecture, and the workspace guidelines. Connector environment values are never included - only variable names and the human-readable use-case hints Codex stores for them.",
    properties: {
      generatedAt: { type: "string", format: "date-time" },
      codexHome: { type: "string", description: "Resolved Codex home directory." },
      memoryRoot: {
        type: "string",
        nullable: true,
        description: "Resolved Codex memory repository, when one was found.",
      },
      summary: { $ref: "#/components/schemas/CodexEcosystemSummary" },
      skills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string", description: "When to use this skill." },
            source: { type: "string", enum: ["system", "plugin", "user"] },
            plugin: { type: "string", nullable: true },
            path: { type: "string" },
            files: { type: "object" },
            calls: { type: "integer", description: "Times this skill's SKILL.md was read." },
          },
        },
      },
      plugins: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            vendor: { type: "string" },
            versions: { type: "array", items: { type: "string" } },
            version: { type: "string", nullable: true },
            skills: { type: "array", items: { type: "string" } },
            path: { type: "string" },
            calls: { type: "integer" },
          },
        },
      },
      connectors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            transport: { type: "string", enum: ["http", "stdio"] },
            url: { type: "string", nullable: true },
            command: { type: "string", nullable: true },
            args: { type: "array", items: { type: "string" } },
            envKeys: { type: "array", items: { type: "string" } },
            referencedEnvVars: { type: "array", items: { type: "string" } },
            useCases: { type: "array", items: { type: "string" } },
            tools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tool: { type: "string" },
                  calls: { type: "integer" },
                },
              },
            },
            calls: { type: "integer" },
          },
        },
      },
      memory: { type: "object", nullable: true, description: "Memory repository layout." },
      guidelines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            scope: { type: "string", enum: ["global", "workspace"] },
            title: { type: "string" },
            path: { type: "string" },
            characters: { type: "integer" },
            blocks: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
  },
};

const paths = {
  "/api/codex/ecosystem": {
    get: {
      tags: ["Codex Ecosystem"],
      summary: "Inspect the local Codex environment",
      description:
        "Returns the installed skills, cached plugins, configured MCP connectors, the memory repository architecture, and the workspace guideline files. Cached for one minute; pass ?refresh=1 to rebuild.",
      operationId: "getCodexEcosystem",
      parameters: [
        {
          name: "refresh",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["1", "true"] },
          description: "Rebuild the snapshot instead of serving the cached one.",
        },
      ],
      responses: {
        200: {
          description: "The Codex environment snapshot.",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CodexEcosystemSnapshot" } },
          },
        },
      },
    },
  },
};

module.exports = { tags, schemas, paths };
