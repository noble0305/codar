import { createServer } from "node:http";
import { scanCodebase } from "../scanner/walker.js";
import { auditCodebase } from "../audit/advisor.js";
import { packageContext } from "../context/packager.js";
import { renderDashboardHtml } from "./template.js";

export function startServer(rootDir, options = {}) {
  const port = options.port || 3030;
  const host = options.host || "127.0.0.1";

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // HTML Dashboard
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const scan = scanCodebase(rootDir);
      const audit = auditCodebase(scan, rootDir);
      const html = renderDashboardHtml({ scan, audit });

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // API: Codebase Scan & Audit JSON
    if (url.pathname === "/api/scan") {
      const scan = scanCodebase(rootDir);
      const audit = auditCodebase(scan, rootDir);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ scan, audit }));
      return;
    }

    // API: Package Context
    if (url.pathname === "/api/package" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const files = parsed.files || [];
          const budget = parsed.budget || 16000;
          const result = packageContext(rootDir, files, { budget });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return new Promise((resolve, reject) => {
    server.on("error", (err) => {
      reject(err);
    });

    server.listen(port, host, () => {
      resolve({
        port,
        host,
        url: `http://${host}:${port}`,
        close: () => new Promise((cb) => server.close(cb))
      });
    });
  });
}
