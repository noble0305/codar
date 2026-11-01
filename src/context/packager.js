import { readFileSync, existsSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { estimateTokens, formatTokens } from "../utils/tokens.js";
import { extractSymbols, generateSkeleton } from "../symbols/extractor.js";
import { detectLanguage } from "../scanner/lang.js";

/**
 * Resolves local relative import paths from JS/TS code
 */
function resolveLocalImport(rootDir, fromFile, importPath) {
  if (!importPath.startsWith("./") && !importPath.startsWith("../")) {
    return null;
  }

  const fromDir = dirname(join(rootDir, fromFile));
  const candidateBase = resolve(fromDir, importPath);

  const extensions = ["", ".js", ".mjs", ".ts", ".tsx", ".jsx", "/index.js", "/index.ts"];
  for (const ext of extensions) {
    const full = candidateBase + ext;
    if (existsSync(full)) {
      return relative(rootDir, full).replace(/\\/g, "/");
    }
  }
  return null;
}

export function packageContext(rootDir, targetFiles = [], options = {}) {
  const tokenBudget = options.budget || 16000;
  const includeDependencies = options.deps !== false;
  
  const filesToInclude = new Set();
  const dependencyMap = new Map();

  // Normalize target paths
  for (const target of targetFiles) {
    const rel = relative(rootDir, resolve(rootDir, target)).replace(/\\/g, "/");
    filesToInclude.add(rel);
  }

  // Discover direct dependencies
  if (includeDependencies) {
    for (const rel of Array.from(filesToInclude)) {
      const full = join(rootDir, rel);
      if (!existsSync(full)) continue;

      try {
        const content = readFileSync(full, "utf8");
        const symbols = extractSymbols(content);
        const resolvedDeps = [];

        for (const imp of symbols.imports) {
          const resolved = resolveLocalImport(rootDir, rel, imp.source);
          if (resolved && !filesToInclude.has(resolved)) {
            resolvedDeps.push(resolved);
          }
        }
        dependencyMap.set(rel, resolvedDeps);
      } catch {}
    }
  }

  const items = [];
  let currentTokens = 0;

  // 1. Pack primary target files
  for (const rel of filesToInclude) {
    const full = join(rootDir, rel);
    if (!existsSync(full)) continue;

    try {
      const content = readFileSync(full, "utf8");
      const tokens = estimateTokens(content);
      const ext = rel.substring(rel.lastIndexOf("."));
      const lang = detectLanguage(ext, rel).name;

      if (currentTokens + tokens <= tokenBudget) {
        items.push({
          type: "full",
          path: rel,
          tokens,
          language: lang,
          content
        });
        currentTokens += tokens;
      } else {
        // Exceeds budget, provide skeleton
        const skeleton = generateSkeleton(rel, content, lang);
        const skelTokens = estimateTokens(skeleton);
        items.push({
          type: "skeleton",
          path: rel,
          tokens: skelTokens,
          language: lang,
          content: skeleton,
          note: `Truncated to skeleton (exceeds remaining token budget of ${formatTokens(tokenBudget - currentTokens)})`
        });
        currentTokens += skelTokens;
      }
    } catch {}
  }

  // 2. Pack secondary dependencies if budget permits
  if (includeDependencies) {
    for (const [parent, deps] of dependencyMap.entries()) {
      for (const dep of deps) {
        if (items.some((i) => i.path === dep)) continue;
        const full = join(rootDir, dep);
        if (!existsSync(full)) continue;

        try {
          const content = readFileSync(full, "utf8");
          const tokens = estimateTokens(content);
          const ext = dep.substring(dep.lastIndexOf("."));
          const lang = detectLanguage(ext, dep).name;

          if (currentTokens + tokens <= tokenBudget) {
            items.push({
              type: "dependency_full",
              path: dep,
              depOf: parent,
              tokens,
              language: lang,
              content
            });
            currentTokens += tokens;
          } else {
            // Include skeleton of dependency
            const skeleton = generateSkeleton(dep, content, lang);
            const skelTokens = estimateTokens(skeleton);
            if (currentTokens + skelTokens <= tokenBudget) {
              items.push({
                type: "dependency_skeleton",
                path: dep,
                depOf: parent,
                tokens: skelTokens,
                language: lang,
                content: skeleton
              });
              currentTokens += skelTokens;
            }
          }
        } catch {}
      }
    }
  }

  // Generate prompt markdown representation
  const markdown = formatContextMarkdown(items, currentTokens, tokenBudget);

  return {
    tokenBudget,
    usedTokens: currentTokens,
    itemCount: items.length,
    items,
    markdown
  };
}

function formatContextMarkdown(items, usedTokens, budget) {
  const lines = [];
  lines.push(`<!-- CODAR CONTEXT BUNDLE: ${items.length} files | ${formatTokens(usedTokens)} / ${formatTokens(budget)} tokens -->`);
  lines.push(`### Codebase Context\n`);

  for (const item of items) {
    if (item.type === "skeleton" || item.type === "dependency_skeleton") {
      lines.push(`#### \`${item.path}\` (Outline / Skeleton)`);
      if (item.depOf) lines.push(`_Imported by: \`${item.depOf}\`_`);
      lines.push("```text");
      lines.push(item.content);
      lines.push("```\n");
    } else {
      lines.push(`#### \`${item.path}\` (${formatTokens(item.tokens)} tokens)`);
      if (item.depOf) lines.push(`_Imported by: \`${item.depOf}\`_`);
      lines.push("```" + item.language.toLowerCase());
      lines.push(item.content);
      lines.push("```\n");
    }
  }

  return lines.join("\n");
}
