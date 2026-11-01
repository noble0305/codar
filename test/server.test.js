import test from "node:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { startServer } from "../src/web/server.js";

test("startServer should serve dashboard and APIs", async () => {
  const rootDir = resolve(".");
  const srv = await startServer(rootDir, { port: 3987 });

  try {
    // 1. Test HTML Dashboard
    const resHtml = await fetch(`${srv.url}/`);
    assert.strictEqual(resHtml.status, 200);
    const htmlText = await resHtml.text();
    assert.ok(htmlText.includes("CODAR ARCHITECTURE RADAR"));

    // 2. Test JSON API
    const resApi = await fetch(`${srv.url}/api/scan`);
    assert.strictEqual(resApi.status, 200);
    const apiData = await resApi.json();
    assert.ok(apiData.scan.fileCount > 0);
    assert.ok(apiData.audit.healthScore > 0);

    // 3. Test Context Package API
    const resPkg = await fetch(`${srv.url}/api/package`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: ["src/index.js"], budget: 5000 })
    });
    assert.strictEqual(resPkg.status, 200);
    const pkgData = await resPkg.json();
    assert.ok(pkgData.items.length > 0);
  } finally {
    await srv.close();
  }
});
