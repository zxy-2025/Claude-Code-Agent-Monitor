/**
 * @file Express router exposing the local Codex ecosystem snapshot.
 *
 * One endpoint returns everything the dashboard renders on the Codex page: the
 * installed skills, the bundled plugins, the configured MCP connectors, the
 * memory repository's layered architecture, and the workspace guideline files.
 *
 * The response is cached for a minute because collecting it walks the Codex
 * home directory and the thread-history database. Pass `?refresh=1` to force
 * a rebuild.
 *
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

const { Router } = require("express");
const { getEcosystemSnapshot } = require("../lib/codex-ecosystem");

const router = Router();

router.get("/ecosystem", (req, res, next) => {
  try {
    const force = req.query.refresh === "1" || req.query.refresh === "true";
    res.json(getEcosystemSnapshot(force));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
