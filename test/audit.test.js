import test from "node:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { scanCodebase } from "../src/scanner/walker.js";
import { auditCodebase } from "../src/audit/advisor.js";

test("auditCodebase should evaluate health score, issues and recommendations", () => {
  const rootDir = resolve(".");
  const scan = scanCodebase(rootDir);
  const audit = auditCodebase(scan, rootDir);

  assert.ok(audit.healthScore >= 0 && audit.healthScore <= 100);
  assert.ok(["A", "B", "C", "D", "F"].includes(audit.grade));
  assert.ok(Array.isArray(audit.issues));
  assert.ok(Array.isArray(audit.hotspots));
  assert.ok(audit.recommendations.length > 0);
});
