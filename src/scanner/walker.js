import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { detectLanguage } from "./lang.js";
import { analyzeContent } from "./analyzer.js";

const DEFAULT_IGNORES = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  ".turbo",
  "coverage",
  ".nyc_output",
  "vendor",
  "__pycache__",
  ".pytest_cache",
  ".venv",
  "venv",
  "env",
  ".idea",
  ".vscode",
  ".DS_Store",
  "Thumbs.db",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml"
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".avif",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp3", ".mp4", ".mov", ".avi", ".wav"
]);

/**
 * Parses simple .gitignore patterns into regexes
 */
function parseGitignore(rootDir) {
  const ignoreFile = join(rootDir, ".gitignore");
  const patterns = [];
  if (existsSync(ignoreFile)) {
    try {
      const content = readFileSync(ignoreFile, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const normalized = line.replace(/^\//, "").replace(/\/$/, "");
        patterns.push(normalized);
      }
    } catch {}
  }
  return patterns;
}

function matchesIgnore(relPath, baseName, ignorePatterns) {
  if (DEFAULT_IGNORES.has(baseName)) return true;
  for (const pattern of ignorePatterns) {
    if (baseName === pattern || relPath === pattern || relPath.startsWith(pattern + "/") || relPath.startsWith(pattern + "\\")) {
      return true;
    }
  }
  return false;
}

export function scanCodebase(rootDir, options = {}) {
  const maxFileSize = options.maxFileSize || 500 * 1024; // 500 KB limit for analysis
  const ignorePatterns = parseGitignore(rootDir);
  const files = [];
  const directories = [];
  let totalBytes = 0;
  let totalTokens = 0;
  let totalLines = 0;
  let totalCode = 0;
  let totalComments = 0;
  let totalBlanks = 0;
  let totalComplexity = 0;

  const langDistribution = {};

  function walk(currentDir) {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relPath = relative(rootDir, fullPath).replace(/\\/g, "/");
      const baseName = entry.name;

      if (matchesIgnore(relPath, baseName, ignorePatterns)) {
        continue;
      }

      if (entry.isDirectory()) {
        directories.push(relPath);
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(baseName);
        if (BINARY_EXTENSIONS.has(ext.toLowerCase())) {
          continue;
        }

        let stat;
        try {
          stat = statSync(fullPath);
        } catch {
          continue;
        }

        if (stat.size > maxFileSize) {
          continue;
        }

        let content = "";
        try {
          content = readFileSync(fullPath, "utf8");
        } catch {
          continue; // Binary or unreadable
        }

        const lang = detectLanguage(ext, baseName);
        const analysis = analyzeContent(content, lang);

        totalBytes += stat.size;
        totalTokens += analysis.tokens;
        totalLines += analysis.lines;
        totalCode += analysis.code;
        totalComments += analysis.comments;
        totalBlanks += analysis.blanks;
        totalComplexity += analysis.complexity;

        langDistribution[lang.name] = langDistribution[lang.name] || {
          files: 0,
          lines: 0,
          tokens: 0,
          type: lang.type
        };
        langDistribution[lang.name].files++;
        langDistribution[lang.name].lines += analysis.lines;
        langDistribution[lang.name].tokens += analysis.tokens;

        files.push({
          path: relPath,
          name: baseName,
          ext,
          language: lang.name,
          type: lang.type,
          size: stat.size,
          mtime: stat.mtimeMs,
          ...analysis
        });
      }
    }
  }

  walk(rootDir);

  // Sort files by token footprint descending
  files.sort((a, b) => b.tokens - a.tokens);

  return {
    rootDir,
    fileCount: files.length,
    dirCount: directories.length,
    totalBytes,
    totalLines,
    totalCode,
    totalComments,
    totalBlanks,
    totalTokens,
    totalComplexity,
    avgComplexity: files.length > 0 ? (totalComplexity / files.length).toFixed(1) : 0,
    languages: langDistribution,
    files,
    directories
  };
}
