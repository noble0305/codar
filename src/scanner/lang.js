// Language detection and grammar characteristics

export const LANGUAGE_MAP = {
  // JavaScript & TypeScript
  ".js": { name: "JavaScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".mjs": { name: "JavaScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".cjs": { name: "JavaScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".jsx": { name: "JavaScript React", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".ts": { name: "TypeScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".mts": { name: "TypeScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".cts": { name: "TypeScript", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".tsx": { name: "TypeScript React", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },

  // Systems / Backend
  ".py": { name: "Python", type: "code", commentSingle: "#", commentBlock: ['"""', '"""'] },
  ".go": { name: "Go", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".rs": { name: "Rust", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".java": { name: "Java", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".c": { name: "C", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".h": { name: "C/C++ Header", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".cpp": { name: "C++", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".hpp": { name: "C++ Header", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".cs": { name: "C#", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".rb": { name: "Ruby", type: "code", commentSingle: "#" },
  ".php": { name: "PHP", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".swift": { name: "Swift", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".kt": { name: "Kotlin", type: "code", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".sh": { name: "Shell", type: "code", commentSingle: "#" },
  ".bash": { name: "Bash", type: "code", commentSingle: "#" },
  ".zsh": { name: "Zsh", type: "code", commentSingle: "#" },
  ".ps1": { name: "PowerShell", type: "code", commentSingle: "#", commentBlock: ["<#", "#>"] },
  ".lua": { name: "Lua", type: "code", commentSingle: "--", commentBlock: ["--[[", "]]"] },
  ".sql": { name: "SQL", type: "code", commentSingle: "--", commentBlock: ["/*", "*/"] },

  // Web & UI
  ".html": { name: "HTML", type: "markup", commentBlock: ["<!--", "-->"] },
  ".htm": { name: "HTML", type: "markup", commentBlock: ["<!--", "-->"] },
  ".vue": { name: "Vue", type: "code", commentBlock: ["<!--", "-->"] },
  ".svelte": { name: "Svelte", type: "code", commentBlock: ["<!--", "-->"] },
  ".css": { name: "CSS", type: "style", commentBlock: ["/*", "*/"] },
  ".scss": { name: "SCSS", type: "style", commentSingle: "//", commentBlock: ["/*", "*/"] },
  ".less": { name: "LESS", type: "style", commentSingle: "//", commentBlock: ["/*", "*/"] },

  // Data & Config
  ".json": { name: "JSON", type: "data" },
  ".yaml": { name: "YAML", type: "config", commentSingle: "#" },
  ".yml": { name: "YAML", type: "config", commentSingle: "#" },
  ".toml": { name: "TOML", type: "config", commentSingle: "#" },
  ".xml": { name: "XML", type: "data", commentBlock: ["<!--", "-->"] },
  ".env": { name: "Env", type: "config", commentSingle: "#" },

  // Documentation
  ".md": { name: "Markdown", type: "doc" },
  ".mdx": { name: "MDX", type: "doc" },
  ".txt": { name: "Text", type: "doc" }
};

export function detectLanguage(ext, filename = "") {
  const lowerExt = ext.toLowerCase();
  if (LANGUAGE_MAP[lowerExt]) {
    return LANGUAGE_MAP[lowerExt];
  }
  
  // Specific filename checks
  const base = filename.toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile.")) {
    return { name: "Dockerfile", type: "config", commentSingle: "#" };
  }
  if (base === "makefile" || base === "gnumakefile") {
    return { name: "Makefile", type: "config", commentSingle: "#" };
  }

  return { name: "Other", type: "other" };
}
