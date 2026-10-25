import { getGitInfo } from "../utils/git.js";

/**
 * Performs architectural hygiene, complexity hotspot, and context efficiency audit.
 */
export function auditCodebase(scanResult, rootDir) {
  const issues = [];
  const hotspots = [];
  let scoreDeductions = 0;

  const gitInfo = getGitInfo(rootDir);
  const churnMap = gitInfo.churnMap || {};

  // 1. Audit individual files
  for (const file of scanResult.files) {
    const issuesForFile = [];

    // Huge file checks
    if (file.lines > 1000) {
      issuesForFile.push({
        severity: "warning",
        type: "huge_file",
        message: `File has ${file.lines} lines (exceeds recommended 1000 LOC limit)`
      });
      scoreDeductions += 4;
    } else if (file.lines > 500) {
      issuesForFile.push({
        severity: "info",
        type: "large_file",
        message: `File has ${file.lines} lines (consider decomposing into smaller modules)`
      });
      scoreDeductions += 1.5;
    }

    // High complexity
    if (file.complexity > 50) {
      issuesForFile.push({
        severity: "warning",
        type: "high_complexity",
        message: `Cyclomatic complexity is ${file.complexity} (high cognitive load)`
      });
      scoreDeductions += 4;
    } else if (file.complexity > 25) {
      issuesForFile.push({
        severity: "info",
        type: "moderate_complexity",
        message: `Cyclomatic complexity is ${file.complexity}`
      });
      scoreDeductions += 2;
    }

    // Deep nesting
    if (file.maxNesting >= 6) {
      issuesForFile.push({
        severity: "warning",
        type: "deep_nesting",
        message: `Maximum nesting depth reaches ${file.maxNesting} levels`
      });
      scoreDeductions += 3;
    }

    // Token footprint trap
    if (file.tokens > 15000) {
      issuesForFile.push({
        severity: "warning",
        type: "token_heavy",
        message: `Contains ~${file.tokens} tokens (may consume disproportionate AI agent context)`
      });
      scoreDeductions += 2;
    }

    // Git churn correlation (hotspot detection)
    const churn = churnMap[file.path] || 0;
    const riskFactor = (file.complexity * 0.6) + (churn * 10);
    if (riskFactor >= 20 || file.complexity >= 30) {
      hotspots.push({
        path: file.path,
        complexity: file.complexity,
        churn,
        riskScore: Math.round(riskFactor),
        lines: file.lines,
        tokens: file.tokens
      });
    }

    if (issuesForFile.length > 0) {
      issues.push({
        path: file.path,
        issues: issuesForFile
      });
    }
  }

  // Sort hotspots by risk score descending
  hotspots.sort((a, b) => b.riskScore - a.riskScore);

  // Calculate final health score (0 - 100)
  const healthScore = Math.max(20, Math.min(100, Math.round(100 - scoreDeductions)));
  let grade = "A";
  if (healthScore < 60) grade = "F";
  else if (healthScore < 70) grade = "D";
  else if (healthScore < 80) grade = "C";
  else if (healthScore < 90) grade = "B";

  const recommendations = [];
  if (hotspots.length > 0) {
    recommendations.push(`Refactor top hotspot: \`${hotspots[0].path}\` (Risk score: ${hotspots[0].riskScore}) to decrease defect probability.`);
  }
  if (scanResult.files.some((f) => f.lines > 800)) {
    recommendations.push("Decompose monolithic files into focused single-responsibility submodules.");
  }
  if (scanResult.files.some((f) => f.maxNesting >= 6)) {
    recommendations.push("Flatten nested conditional blocks using early returns / guard clauses.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Codebase structure is clean, modular, and optimized for AI context consumption.");
  }

  return {
    healthScore,
    grade,
    totalIssues: issues.reduce((acc, i) => acc + i.issues.length, 0),
    issues,
    hotspots: hotspots.slice(0, 10),
    recommendations,
    git: gitInfo
  };
}
