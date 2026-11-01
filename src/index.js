/**
 * Codar — The Intelligent Codebase Architecture Radar & Context Engine
 * Programmatic API Entrypoint
 */

export { scanCodebase } from "./scanner/walker.js";
export { analyzeContent } from "./scanner/analyzer.js";
export { detectLanguage } from "./scanner/lang.js";
export { extractSymbols, generateSkeleton } from "./symbols/extractor.js";
export { packageContext } from "./context/packager.js";
export { buildAgentMap, syncAgentFile, isAgentMapStale } from "./agents/agentsMap.js";
export { auditCodebase } from "./audit/advisor.js";
export { startServer } from "./web/server.js";
export { renderDashboardHtml } from "./web/template.js";
export { estimateTokens, formatTokens, formatBytes } from "./utils/tokens.js";
export { getGitInfo } from "./utils/git.js";
