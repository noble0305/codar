import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildAgentMap, syncAgentFile, isAgentMapStale } from "../src/agents/agentsMap.js";

function makeFixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), "codar-agents-"));
  mkdirSync(join(root, "src", "utils"), { recursive: true });
  writeFileSync(join(root, "src", "main.js"), 'import { helper } from "./utils/helper.js";\nexport function main() { return helper(); }\n');
  writeFileSync(join(root, "src", "utils", "helper.js"), "export function helper() { return 1; }\n");
  return root;
}

test("buildAgentMap should produce a budgeted map with dirs and imports", () => {
  const root = makeFixtureRepo();
  const result = buildAgentMap(root, { budget: 2000 });
  assert.ok(result.markdown.includes("src/"));
  assert.ok(result.markdown.includes("src/main.js -> src/utils/helper.js"));
  assert.ok(result.usedTokens <= 2000);
  assert.equal(result.trimmed, false);
});

test("buildAgentMap should degrade to directory-only when budget is tight", () => {
  const root = makeFixtureRepo();
  const result = buildAgentMap(root, { budget: 10 });
  assert.equal(result.trimmed, true);
  assert.ok(!result.markdown.includes("⚡"));
});

test("syncAgentFile should create the block and preserve manual content", () => {
  const root = makeFixtureRepo();
  const first = syncAgentFile(root);
  assert.ok(existsSync(first.filePath));

  const file = readFileSync(first.filePath, "utf8");
  assert.ok(file.includes("<!-- codar:begin -->"));
  assert.ok(file.includes("<!-- codar:manual -->"));

  writeFileSync(first.filePath, file.replace(
    "This section is preserved when the map regenerates.)",
    "This section is preserved when the map regenerates.)\n- Never touch legacy code."
  ));
  syncAgentFile(root);
  const updated = readFileSync(first.filePath, "utf8");
  assert.ok(updated.includes("- Never touch legacy code."));
  assert.equal(updated.match(/<!-- codar:begin -->/g).length, 1);
});

test("isAgentMapStale should flag missing and existing maps", () => {
  const root = makeFixtureRepo();
  assert.equal(isAgentMapStale(root).reason, "missing");
  syncAgentFile(root);
  const status = isAgentMapStale(root);
  assert.equal(status.stale, false);
});
