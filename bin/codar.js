#!/usr/bin/env node

import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { c, banner, table, pad, progressBar } from "../src/utils/format.js";
import { scanCodebase } from "../src/scanner/walker.js";
import { auditCodebase } from "../src/audit/advisor.js";
import { packageContext } from "../src/context/packager.js";
import { generateSkeleton } from "../src/symbols/extractor.js";
import { startServer } from "../src/web/server.js";
import { renderDashboardHtml } from "../src/web/template.js";
import { formatTokens, formatBytes } from "../src/utils/tokens.js";

const VERSION = "1.0.0";

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h" || command === "help") {
  printHelp();
  process.exit(0);
}

if (command === "--version" || command === "-v" || command === "version") {
  console.log(`codar v${VERSION}`);
  process.exit(0);
}

const targetDir = resolve(args[1] && !args[1].startsWith("-") ? args[1] : process.cwd());

try {
  switch (command) {
    case "scan":
      runScan(targetDir, args.slice(1));
      break;
    case "map":
      runMap(targetDir, args.slice(1));
      break;
    case "context":
      runContext(args.slice(1));
      break;
    case "audit":
      runAudit(targetDir, args.slice(1));
      break;
    case "ui":
    case "serve":
      await runUi(targetDir, args.slice(1));
      break;
    case "export":
      runExport(targetDir, args.slice(1));
      break;
    default:
      console.error(c.red(`Unknown command: ${command}`));
      printHelp();
      process.exit(1);
  }
} catch (err) {
  console.error(c.red(`\nError: ${err.message}`));
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
}

function printHelp() {
  console.log(banner());
  console.log(`
${c.bold("USAGE:")}
  codar <command> [options]

${c.bold("COMMANDS:")}
  ${c.cyan("scan")} [dir]                 Deep scan codebase metrics (LOC, tokens, languages)
  ${c.cyan("map")} [dir]                  Generate LLM-optimized symbol skeleton map
  ${c.cyan("context")} <files...>         Pack files & dependencies within token budget
  ${c.cyan("audit")} [dir]                Run architecture health & complexity hotspot audit
  ${c.cyan("ui")} [dir]                   Launch interactive local web dashboard
  ${c.cyan("export")} [dir]               Export standalone single-file HTML report

${c.bold("OPTIONS:")}
  --budget <tokens>         Token budget for context packager (default: 16000)
  --port <number>           Port for Web UI server (default: 3030)
  --output, -o <path>       Output destination file for export or context
  --json                    Output machine-readable JSON format
  -v, --version             Show version
  -h, --help                Show help menu

${c.bold("EXAMPLES:")}
  codar scan
  codar map --max 10
  codar context src/index.js src/web/server.js --budget 8000
  codar audit
  codar ui --port 3030
  codar export -o report.html
`);
}

function runScan(dir, rawArgs) {
  const isJson = rawArgs.includes("--json");
  const scan = scanCodebase(dir);

  if (isJson) {
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  console.log(banner());
  console.log(c.bold(`Codebase Scan: `) + c.cyan(dir) + "\n");

  const statHeaders = ["Metric", "Value"];
  const statRows = [
    ["Files Scanned", scan.fileCount],
    ["Directories", scan.dirCount],
    ["Total Lines", scan.totalLines.toLocaleString()],
    ["Code Lines", scan.totalCode.toLocaleString()],
    ["Comments", scan.totalComments.toLocaleString()],
    ["Blank Lines", scan.totalBlanks.toLocaleString()],
    ["Estimated Tokens", c.bold(c.cyan(formatTokens(scan.totalTokens))) + c.dim(` (${scan.totalTokens.toLocaleString()} tokens)`)]
  ];
  console.log(table(statHeaders, statRows));
  console.log("");

  // Languages Table
  const langHeaders = ["Language", "Files", "Lines", "% Share", "Tokens"];
  const langRows = Object.entries(scan.languages)
    .sort((a, b) => b[1].lines - a[1].lines)
    .map(([lang, info]) => {
      const pct = scan.totalLines > 0 ? (info.lines / scan.totalLines) * 100 : 0;
      return [
        c.bold(lang),
        info.files,
        info.lines.toLocaleString(),
        progressBar(pct, 12),
        formatTokens(info.tokens)
      ];
    });
  console.log(c.bold("Language Breakdown:"));
  console.log(table(langHeaders, langRows));
  console.log("");

  // Top Token Heavy Files
  const topFilesHeaders = ["Top Token Files", "Lines", "Complexity", "Tokens"];
  const topFilesRows = scan.files.slice(0, 5).map((f) => [
    f.path,
    f.lines,
    f.complexity,
    c.cyan(formatTokens(f.tokens))
  ]);
  console.log(c.bold("Highest Context Footprint:"));
  console.log(table(topFilesHeaders, topFilesRows));
  console.log("");
}

function runMap(dir, rawArgs) {
  const maxIdx = rawArgs.indexOf("--max");
  const max = maxIdx !== -1 && rawArgs[maxIdx + 1] ? parseInt(rawArgs[maxIdx + 1], 10) : 20;

  const scan = scanCodebase(dir);
  console.log(banner());
  console.log(c.bold(`Codebase Symbol Skeleton Map (${scan.files.length} files detected):`));
  console.log(c.dim(`Showing top ${Math.min(max, scan.files.length)} files by weight:\n`));

  const targetFiles = scan.files.slice(0, max);
  for (const f of targetFiles) {
    const fullPath = resolve(dir, f.path);
    try {
      const skeleton = generateSkeleton(f.path, f.codeLines ? "" : f.content || "", f.language);
      console.log(skeleton);
      console.log("");
    } catch {
      console.log(`📄 ${f.path} (${f.lines} lines, ${formatTokens(f.tokens)} tokens)`);
    }
  }
}

function runContext(rawArgs) {
  let budget = 16000;
  let outPath = null;
  const files = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--budget" && rawArgs[i + 1]) {
      budget = parseInt(rawArgs[++i], 10);
    } else if ((arg === "--output" || arg === "-o") && rawArgs[i + 1]) {
      outPath = rawArgs[++i];
    } else if (!arg.startsWith("-")) {
      files.push(arg);
    }
  }

  if (files.length === 0) {
    console.error(c.red("Error: Please specify one or more file paths to package into context."));
    console.log(c.dim("Example: codar context src/index.js src/utils/tokens.js --budget 8000\n"));
    process.exit(1);
  }

  const result = packageContext(process.cwd(), files, { budget });

  if (outPath) {
    writeFileSync(resolve(process.cwd(), outPath), result.markdown, "utf8");
    console.log(c.green(`✓ Context package saved to: ${outPath} (${formatTokens(result.usedTokens)} / ${formatTokens(budget)} tokens)`));
  } else {
    console.log(result.markdown);
    console.error(c.dim(`\n--- [Codar Context: ${result.itemCount} items, ${formatTokens(result.usedTokens)} / ${formatTokens(budget)} tokens] ---`));
  }
}

function runAudit(dir, rawArgs) {
  const isJson = rawArgs.includes("--json");
  const scan = scanCodebase(dir);
  const audit = auditCodebase(scan, dir);

  if (isJson) {
    console.log(JSON.stringify(audit, null, 2));
    return;
  }

  console.log(banner());
  console.log(c.bold(`Architectural Health Audit: `) + c.cyan(dir) + "\n");

  const gradeColor = audit.grade === "A" ? c.green : audit.grade === "B" ? c.cyan : audit.grade === "C" ? c.yellow : c.red;
  console.log(`Health Grade:  ${gradeColor(c.bold(audit.grade))} (${audit.healthScore}/100)`);
  console.log(`Total Issues:  ${audit.totalIssues === 0 ? c.green("0 issues detected") : c.yellow(audit.totalIssues + " issues found")}`);
  console.log("");

  if (audit.hotspots.length > 0) {
    console.log(c.bold("Refactoring Hotspots (Complexity & Git Churn):"));
    const hsHeaders = ["Path", "Complexity", "Churn", "Risk Score"];
    const hsRows = audit.hotspots.map((h) => [
      h.path,
      h.complexity,
      `${h.churn} commits`,
      c.red(c.bold(h.riskScore))
    ]);
    console.log(table(hsHeaders, hsRows));
    console.log("");
  }

  console.log(c.bold("Recommendations:"));
  for (const rec of audit.recommendations) {
    console.log(`  ${c.cyan("•")} ${rec}`);
  }
  console.log("");
}

async function runUi(dir, rawArgs) {
  let port = 3030;
  const portIdx = rawArgs.indexOf("--port");
  if (portIdx !== -1 && rawArgs[portIdx + 1]) {
    port = parseInt(rawArgs[portIdx + 1], 10);
  }

  console.log(banner());
  console.log(c.dim("Starting Codar Web Radar Server..."));

  try {
    const srv = await startServer(dir, { port });
    console.log(c.green(`✓ Codar Dashboard active at: `) + c.bold(c.cyan(srv.url)));
    console.log(c.dim("  Press Ctrl+C to stop server.\n"));
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      const fallback = port + 1;
      const srv = await startServer(dir, { port: fallback });
      console.log(c.yellow(`Port ${port} in use. Started on: `) + c.bold(c.cyan(srv.url)));
      console.log(c.dim("  Press Ctrl+C to stop server.\n"));
    } else {
      throw err;
    }
  }
}

function runExport(dir, rawArgs) {
  let outPath = "codar-report.html";
  const oIdx = rawArgs.indexOf("-o") !== -1 ? rawArgs.indexOf("-o") : rawArgs.indexOf("--output");
  if (oIdx !== -1 && rawArgs[oIdx + 1]) {
    outPath = rawArgs[oIdx + 1];
  }

  const scan = scanCodebase(dir);
  const audit = auditCodebase(scan, dir);
  const html = renderDashboardHtml({ scan, audit }, true);

  const dest = resolve(dir, outPath);
  writeFileSync(dest, html, "utf8");

  console.log(banner());
  console.log(c.green(`✓ Standalone report generated: `) + c.bold(dest));
  console.log(c.dim(`  Open this file in any web browser to view the interactive radar.\n`));
}
