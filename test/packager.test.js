import test from "node:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { packageContext } from "../src/context/packager.js";

test("packageContext should package files and respect token limits", () => {
  const rootDir = resolve(".");
  const targetFiles = ["src/utils/tokens.js", "src/scanner/lang.js"];
  
  const result = packageContext(rootDir, targetFiles, { budget: 5000 });

  assert.ok(result.items.length >= 2);
  assert.ok(result.usedTokens > 0);
  assert.ok(result.usedTokens <= 5000);
  assert.ok(result.markdown.includes("<!-- ORCA CONTEXT BUNDLE:"));
  assert.ok(result.markdown.includes("src/utils/tokens.js"));
});

test("packageContext should fallback to skeleton if budget is exceeded", () => {
  const rootDir = resolve(".");
  const targetFiles = ["src/web/template.js"];
  
  // Very small budget
  const result = packageContext(rootDir, targetFiles, { budget: 200 });

  assert.strictEqual(result.items.length, 1);
  assert.strictEqual(result.items[0].type, "skeleton");
  assert.ok(result.items[0].note.includes("Truncated to skeleton"));
});
