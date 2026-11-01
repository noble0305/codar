/**
 * Agent map generator: builds a token-budgeted repo map for AI agent system
 * prompts and syncs it into an AGENTS.md-managed block.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { scanCodebase } from "../scanner/walker.js";
import { generateSkeleton } from "../symbols/extractor.js";
import { estimateTokens, formatTokens } from "../utils/tokens.js";
import { getGitInfo } from "../utils/git.js";

export const BLOCK_BEGIN = "<!-- codar:begin -->";
export const BLOCK_END = "<!-- codar:end -->";
const GENERATED_BEGIN = "<!-- codar:generated -->";
const GENERATED_END = "<!-- /codar:generated -->";
const MANUAL_BEGIN = "<!-- codar:manual -->";
const MANUAL_END = "<!-- /codar:manual -->";

const IMPORT_EXTENSIONS = ["", ".js", ".ts", ".mjs", ".jsx", ".tsx", "/index.js", "/index.ts"];

/**
 * Builds the generated section of the agent map within a token budget.
 * Downgrades symbol-level expansions when the budget is tight.
 */
export function buildAgentMap(rootDir, options = {}) {
  const budget = options.budget || 2000;
  const scan = scanCodebase(rootDir);
  const git = getGitInfo(rootDir);

  const byDir = new Map();
  for (const f of scan.files) {
    const dir = dirname(f.path) === "." ? "." : dirname(f.path);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(f);
  }

  const dirLines = [...byDir.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dir, files]) => {
      const tokens = files.reduce((sum, f) => sum + f.tokens, 0);
      const names = files.slice(0, 4).map((f) => f.path.split("/").pop()).join(", ");
      const more = files.length > 4 ? `, +${files.length - 4}` : "";
      return `- ${dir === "." ? "(root)" : dir}/ — ${files.length} file(s), ~${formatTokens(tokens)} tokens: ${names}${more}`;
    });

  const fileSet = new Set(scan.files.map((f) => f.path));
  const edges = [];
  for (const f of scan.files) {
    const symbols = extractImports(join(rootDir, f.path));
    for (const source of symbols) {
      const target = resolveImport(rootDir, dirname(f.path), source, fileSet);
      if (target && target !== f.path) edges.push(`${f.path} -> ${target}`);
    }
  }
  const uniqueEdges = [...new Set(edges)].sort();

  const topComplex = [...scan.files]
    .sort((a, b) => b.complexity - a.complexity)
    .slice(0, 5);
  const skeletons = topComplex.map((f) => {
    try {
      return generateSkeleton(f.path, readSource(join(rootDir, f.path)), f.language);
    } catch {
      return `📄 ${f.path}`;
    }
  });

  const head = git.isGit && git.lastCommit ? git.lastCommit.hash : "none";
  const full = renderGenerated(dirLines, uniqueEdges, skeletons, head, false);
  const fullTokens = estimateTokens(full);
  if (fullTokens <= budget) {
    return { markdown: full, usedTokens: fullTokens, budget, trimmed: false, head, fileCount: scan.files.length };
  }

  const slim = renderGenerated(dirLines, uniqueEdges, [], head, true);
  return { markdown: slim, usedTokens: estimateTokens(slim), budget, trimmed: true, head, fileCount: scan.files.length };
}

function readSource(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function extractImports(path) {
  const content = readSource(path);
  const sources = [];
  const patterns = [
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+)?['"]([^'"]+)['"]/,
    /(?:const|let|var)\s+.*=\s*require\(['"]([^'"]+)['"]\)/,
    /^(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/
  ];
  for (const line of content.split(/\r?\n/)) {
    for (const pattern of patterns) {
      const m = line.trim().match(pattern);
      if (m) sources.push(m[1] || m[2]);
    }
  }
  return sources;
}

function renderGenerated(dirLines, edges, skeletons, head, trimmed) {
  const parts = [];
  parts.push("# Codar Repo Map");
  parts.push(`<!-- codar-head: ${head} -->`);
  parts.push("");
  parts.push("## Directory Structure");
  parts.push(...dirLines);
  if (edges.length > 0) {
    parts.push("");
    parts.push("## Internal Imports (direct)");
    parts.push(...edges.slice(0, 60).map((e) => `- ${e}`));
  }
  if (skeletons.length > 0) {
    parts.push("");
    parts.push("## Key Files (top complexity)");
    parts.push(...skeletons);
  }
  if (trimmed) {
    parts.push("");
    parts.push("> Content trimmed to fit token budget. Raise --budget for symbol-level detail.");
  }
  return parts.join("\n");
}

function resolveImport(rootDir, fromDir, source, fileSet) {
  if (!source || !source.startsWith(".")) return null;
  const base = relative(rootDir, resolve(rootDir, fromDir, source));
  for (const ext of IMPORT_EXTENSIONS) {
    const candidate = base + ext;
    if (fileSet.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Creates or updates the codar block in an AGENTS.md file, preserving any
 * user-authored content inside the codar:manual section.
 */
export function syncAgentFile(rootDir, options = {}) {
  const filePath = resolve(rootDir, options.output || "AGENTS.md");
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
  const manual = existing ? extractSection(existing, MANUAL_BEGIN, MANUAL_END) : null;
  const manualBody = manual === null
    ? "- (Describe repo rules for your agent here. This section is preserved when the map regenerates.)"
    : manual.trimEnd();

  const map = buildAgentMap(rootDir, options);
  const block = [
    BLOCK_BEGIN,
    GENERATED_BEGIN,
    map.markdown,
    GENERATED_END,
    MANUAL_BEGIN,
    manualBody,
    MANUAL_END,
    BLOCK_END
  ].join("\n");

  let content;
  if (existing && existing.includes(BLOCK_BEGIN) && existing.includes(BLOCK_END)) {
    const start = existing.indexOf(BLOCK_BEGIN);
    const end = existing.indexOf(BLOCK_END) + BLOCK_END.length;
    content = existing.slice(0, start) + block + existing.slice(end);
  } else {
    const header = "# Agent Guide\n\n" + (existing ? existing.trimEnd() + "\n\n" : "");
    content = header + block + "\n";
  }

  writeFileSync(filePath, content, "utf8");
  return { filePath, usedTokens: map.usedTokens, budget: map.budget, trimmed: map.trimmed, created: !existing };
}

/**
 * Detects whether the map in an existing file is stale relative to git HEAD.
 */
export function isAgentMapStale(rootDir, filePath = "AGENTS.md") {
  const fullPath = resolve(rootDir, filePath);
  if (!existsSync(fullPath)) {
    return { stale: true, reason: "missing", filePath: fullPath };
  }
  const content = readFileSync(fullPath, "utf8");
  const match = content.match(/<!-- codar-head: (\S+) -->/);
  if (!match) {
    return { stale: true, reason: "no-map", filePath: fullPath };
  }
  const git = getGitInfo(rootDir);
  const currentHead = git.isGit && git.lastCommit ? git.lastCommit.hash : "none";
  if (match[1] !== currentHead) {
    return { stale: true, reason: "head-changed", storedHead: match[1], currentHead, filePath: fullPath };
  }
  return { stale: false, currentHead, filePath: fullPath };
}

function extractSection(content, begin, end) {
  const start = content.indexOf(begin);
  if (start === -1) return null;
  const stop = content.indexOf(end, start);
  if (stop === -1) return null;
  return content.slice(start + begin.length, stop).trim();
}
