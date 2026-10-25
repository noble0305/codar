import test from "node:test";
import assert from "node:assert";
import { extractSymbols, generateSkeleton } from "../src/symbols/extractor.js";

test("extractSymbols should extract JS/TS functions, classes, imports and exports", () => {
  const code = `
    import { scan } from "./walker.js";
    import * as fs from "node:fs";

    export class ModelManager extends BaseManager {
      constructor() {}
    }

    export async function processData(items, options) {
      return items.length;
    }

    const helperFn = (val) => val * 2;
  `;

  const symbols = extractSymbols(code, "JavaScript");
  assert.strictEqual(symbols.imports.length, 2);
  assert.strictEqual(symbols.imports[0].source, "./walker.js");

  assert.strictEqual(symbols.classes.length, 1);
  assert.strictEqual(symbols.classes[0].name, "ModelManager");
  assert.strictEqual(symbols.classes[0].extends, "BaseManager");

  assert.strictEqual(symbols.functions.length, 2);
  assert.strictEqual(symbols.functions[0].name, "processData");
  assert.strictEqual(symbols.functions[0].isExport, true);
  assert.strictEqual(symbols.functions[1].name, "helperFn");
});

test("generateSkeleton should output a clean visual outline", () => {
  const code = `
    import { foo } from "./foo.js";
    export function execute() {}
  `;
  const skeleton = generateSkeleton("src/main.js", code, "JavaScript");
  assert.ok(skeleton.includes("📄 src/main.js"));
  assert.ok(skeleton.includes("execute()"));
  assert.ok(skeleton.includes("./foo.js"));
});
