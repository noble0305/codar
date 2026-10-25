import test from "node:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { scanCodebase } from "../src/scanner/walker.js";
import { detectLanguage } from "../src/scanner/lang.js";
import { analyzeContent } from "../src/scanner/analyzer.js";

test("detectLanguage should identify common languages", () => {
  assert.strictEqual(detectLanguage(".js").name, "JavaScript");
  assert.strictEqual(detectLanguage(".ts").name, "TypeScript");
  assert.strictEqual(detectLanguage(".py").name, "Python");
  assert.strictEqual(detectLanguage(".go").name, "Go");
  assert.strictEqual(detectLanguage("", "Dockerfile").name, "Dockerfile");
});

test("analyzeContent should calculate lines and complexity accurately", () => {
  const code = `
    // A sample function
    function calculate(x) {
      if (x > 10) {
        return x * 2;
      } else {
        return x;
      }
    }
  `;
  const result = analyzeContent(code, { type: "code", commentSingle: "//" });
  assert.ok(result.lines >= 9);
  assert.ok(result.code >= 7);
  assert.ok(result.comments >= 1);
  assert.ok(result.complexity >= 2);
  assert.ok(result.tokens > 0);
});

test("scanCodebase should scan the current repository directory", () => {
  const rootDir = resolve(".");
  const scan = scanCodebase(rootDir);

  assert.ok(scan.fileCount > 0);
  assert.ok(scan.totalLines > 0);
  assert.ok(scan.totalTokens > 0);
  assert.ok(scan.languages["JavaScript"]);
  assert.ok(Array.isArray(scan.files));
});
