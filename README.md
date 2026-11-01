# Codar 🐋

> **The Intelligent Codebase Architecture Radar & Context Engine for AI Coding Agents and Developers.**

[![CI](https://github.com/noble0305/codar/actions/workflows/ci.yml/badge.svg)](https://github.com/noble0305/codar/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20runtime-00f2fe)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

```text
      .---.              
     /  .  \               CODAR — Codebase Architecture Radar
    |  /|   |              & Context Engine for AI Coding Agents
    | | |   | ___        
    \  \|  / '  _)         v1.0.0 • High-Performance Local CLI
     `---'-"""""         
```

**Codar** is a lightning-fast, zero-dependency codebase intelligence tool built for the modern AI coding era. It calculates code complexity, language distribution, and estimated LLM token footprints across your entire repository, automatically detects architectural defect hotspots, and packages your source code into token-budgeted prompt contexts for models like Gemini, Claude, and GPT-4.

---

## ✨ Features

- ⚡ **Zero Runtime Dependencies**: Ultra-lightweight, built entirely using modern Node.js standards (ESM, `node:test`, `node:http`).
- 🧠 **AI Token Footprint Estimator**: Estimates token consumption (cl100k / Claude / Gemini heuristics) across every file and module.
- 🎯 **Defect Hotspot Detection**: Correlates cyclomatic code complexity with Git churn history to highlight defect-prone code before bugs happen.
- 📦 **Smart Context Packager**: Automatically bundles files, resolves local imports, respects token budgets (e.g. 8k, 16k, 32k), and degrades to skeleton outlines when budgets are exceeded.
- 🗺️ **Symbol Skeleton Generator**: Generates high-level structural outlines (functions, classes, exports, imports) at ~90% token reduction compared to raw code.
- 🖥️ **Interactive Oceanic Web Dashboard**: Launch a local web radar (`codar ui`) with dark cyber visuals, or export a self-contained offline HTML report (`codar export`).
- 🛠️ **Programmatic API**: Full JavaScript / TypeScript API for integrating into CI/CD pipelines, dev bots, or agent sidecars.

---

## 🚀 Quick Start

### Installation

Clone the repository or install globally:

```bash
git clone https://github.com/noble0305/codar.git
cd codar
npm link   # Optional: Makes `codar` available globally in your terminal
```

Or run directly with Node:

```bash
node ./bin/codar.js <command>
```

---

## 💻 CLI Commands

### 1. `codar scan [dir]`
Scans directory structure, counts lines of code (LOC), comments, blank lines, and calculates token footprints by language:

```bash
codar scan
```

Output:
```text
Codebase Scan: /workspace/codar

Metric            Value                
────────────────  ─────────────────────
Files Scanned     21                   
Directories       9                    
Total Lines       2,358                
Code Lines        1,962                
Comments          111                  
Blank Lines       285                  
Estimated Tokens  29.2k (29,155 tokens)

Language Breakdown:
Language    Files  Lines  % Share             Tokens
──────────  ─────  ─────  ──────────────────  ──────
JavaScript  18     2,265  ████████████ 96.1%  28.4k 
Other       2      58     ░░░░░░░░░░░░ 2.5%   472   
JSON        1      35     ░░░░░░░░░░░░ 1.5%   332   
```

### 2. `codar map [dir] [--max <count>]`
Generates an LLM-optimized structural skeleton map of the repository without raw function bodies:

```bash
codar map --max 10
```

**Agent map** — generate or update a token-budgeted repo map inside `AGENTS.md` so your AI coding agent (Claude Code, Codex, Cursor, ...) knows your architecture from the first session:

```bash
# Generate/update the codar block in AGENTS.md (2,000 token budget by default)
codar map --agents

# More room for symbol-level detail of top-complexity files
codar map --agents --budget 4000

# CI / pre-commit: exit non-zero when the map is stale relative to git HEAD
codar map --agents --check
```

The block is split into a `codar:generated` section (managed by codar: directory structure, direct import graph, key files) and a `codar:manual` section (your own agent rules, preserved on regeneration).

### 3. `codar context <files...> [--budget <tokens>] [--output <file>]`
Packages targeted source files and their local dependencies into a token-budgeted prompt Markdown snippet:

```bash
# Package entrypoints within an 8,000 token budget
codar context src/index.js src/utils/tokens.js --budget 8000 -o prompt-context.md
```

### 4. `codar audit [dir]`
Runs an architectural health audit, scans for monolithic files, deep nesting, and correlates git commit churn:

```bash
codar audit
```

### 5. `codar ui [dir] [--port <number>]`
Launches the interactive local Web Dashboard with KPI cards, language breakdowns, and the interactive Context Packager:

```bash
codar ui --port 3030
```

### 6. `codar export [dir] [--output <file>]`
Exports a standalone, single-file HTML report that can be opened anywhere or published to GitHub Pages:

```bash
codar export -o codar-architecture.html
```

---

## 🧩 Programmatic API

You can also use Codar directly inside your own Node.js scripts or agents:

```javascript
import { 
  scanCodebase, 
  auditCodebase, 
  packageContext, 
  estimateTokens 
} from "codar-code";

// 1. Scan Codebase
const scan = scanCodebase(process.cwd());
console.log(`Total Tokens: ${scan.totalTokens}`);

// 2. Audit Health
const audit = auditCodebase(scan, process.cwd());
console.log(`Health Grade: ${audit.grade} (${audit.healthScore}/100)`);

// 3. Package Context for LLM
const bundle = packageContext(process.cwd(), ["src/index.js"], { budget: 4000 });
console.log(bundle.markdown);
```

---

## 🧪 Testing

Codar uses Node's built-in native test runner:

```bash
npm test
```

---

## 📄 License

[MIT](LICENSE) © 2026 [wangzhi](https://github.com/noble0305)
