# Agent Guide

<!-- codar:begin -->
<!-- codar:generated -->
# Codar Repo Map
<!-- codar-head: cfc0680 -->

## Directory Structure
- (root)/ — 5 file(s), ~3.3k tokens: README.md, AGENTS.md, LICENSE, package.json, +1
- .github/workflows/ — 1 file(s), ~212 tokens: ci.yml
- bin/ — 1 file(s), ~4.4k tokens: codar.js
- src/ — 1 file(s), ~277 tokens: index.js
- src/agents/ — 1 file(s), ~2.9k tokens: agentsMap.js
- src/audit/ — 1 file(s), ~1.4k tokens: advisor.js
- src/context/ — 1 file(s), ~2.0k tokens: packager.js
- src/scanner/ — 3 file(s), ~4.5k tokens: lang.js, walker.js, analyzer.js
- src/symbols/ — 1 file(s), ~2.0k tokens: extractor.js
- src/utils/ — 3 file(s), ~2.6k tokens: format.js, tokens.js, git.js
- src/web/ — 2 file(s), ~9.6k tokens: template.js, server.js
- test/ — 6 file(s), ~3.1k tokens: agentsMap.test.js, scanner.test.js, symbols.test.js, server.test.js, +2

## Internal Imports (direct)
- bin/codar.js -> src/agents/agentsMap.js
- bin/codar.js -> src/audit/advisor.js
- bin/codar.js -> src/context/packager.js
- bin/codar.js -> src/scanner/walker.js
- bin/codar.js -> src/symbols/extractor.js
- bin/codar.js -> src/utils/format.js
- bin/codar.js -> src/utils/tokens.js
- bin/codar.js -> src/web/server.js
- bin/codar.js -> src/web/template.js
- src/agents/agentsMap.js -> src/scanner/walker.js
- src/agents/agentsMap.js -> src/symbols/extractor.js
- src/agents/agentsMap.js -> src/utils/git.js
- src/agents/agentsMap.js -> src/utils/tokens.js
- src/audit/advisor.js -> src/utils/git.js
- src/context/packager.js -> src/scanner/lang.js
- src/context/packager.js -> src/symbols/extractor.js
- src/context/packager.js -> src/utils/tokens.js
- src/scanner/analyzer.js -> src/utils/tokens.js
- src/scanner/walker.js -> src/scanner/analyzer.js
- src/scanner/walker.js -> src/scanner/lang.js
- src/web/server.js -> src/audit/advisor.js
- src/web/server.js -> src/context/packager.js
- src/web/server.js -> src/scanner/walker.js
- src/web/server.js -> src/web/template.js
- test/agentsMap.test.js -> src/agents/agentsMap.js
- test/audit.test.js -> src/audit/advisor.js
- test/audit.test.js -> src/scanner/walker.js
- test/packager.test.js -> src/context/packager.js
- test/scanner.test.js -> src/scanner/analyzer.js
- test/scanner.test.js -> src/scanner/lang.js
- test/scanner.test.js -> src/scanner/walker.js
- test/server.test.js -> src/web/server.js
- test/symbols.test.js -> src/symbols/extractor.js

## Key Files (top complexity)
📄 bin/codar.js
  ├─ 📦 imports: node:path, node:fs, ../src/utils/format.js, ../src/scanner/walker.js, ../src/audit/advisor.js +6 more
  ├─ ⚡ printHelp() (L64)
  ├─ ⚡ runScan(dir, rawArgs) (L99)
  ├─ ⚡ runMap(dir, rawArgs) (L155)
  ├─ ⚡ runAgentMap(dir, rawArgs) (L181)
  ├─ ⚡ runContext(rawArgs) (L203)
  ├─ ⚡ runAudit(dir, rawArgs) (L236)
  ├─ ⚡ runUi(dir, rawArgs) (L274)
  ├─ ⚡ runExport(dir, rawArgs) (L300)
📄 src/context/packager.js
  ├─ 📦 imports: node:fs, node:path, ../utils/tokens.js, ../symbols/extractor.js, ../scanner/lang.js
  ├─ ⚡ resolveLocalImport(rootDir, fromFile, importPath) (L10)
  ├─ ⚡ packageContext(rootDir, targetFiles = [], options = {}) [export] (L28)
  ├─ ⚡ formatContextMarkdown(items, usedTokens, budget) (L160)
📄 src/agents/agentsMap.js
  ├─ 📦 imports: node:fs, node:path, ../scanner/walker.js, ../symbols/extractor.js, ../utils/tokens.js +1 more
  ├─ ⚡ buildAgentMap(rootDir, options = {}) [export] (L26)
  ├─ ⚡ readSource(path) (L80)
  ├─ ⚡ extractImports(path) (L88)
  ├─ ⚡ renderGenerated(dirLines, edges, skeletons, head, trimmed) (L105)
  ├─ ⚡ resolveImport(rootDir, fromDir, source, fileSet) (L129)
  ├─ ⚡ syncAgentFile(rootDir, options = {}) [export] (L143)
  ├─ ⚡ isAgentMapStale(rootDir, filePath = "AGENTS.md") [export] (L180)
  ├─ ⚡ extractSection(content, begin, end) (L198)
📄 src/symbols/extractor.js
  ├─ 🏛️ class $ (L133)
  ├─ ⚡ extractSymbols(content, language = "JavaScript") [export] (L6)
  ├─ ⚡ generateSkeleton(relPath, content, language) [export] (L118)
📄 src/audit/advisor.js
  ├─ 📦 imports: ../utils/git.js
  ├─ ⚡ auditCodebase(scanResult, rootDir) [export] (L6)
<!-- /codar:generated -->
<!-- codar:manual -->
- (Describe repo rules for your agent here. This section is preserved when the map regenerates.)
<!-- /codar:manual -->
<!-- codar:end -->
