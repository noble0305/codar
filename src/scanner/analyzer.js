import { estimateTokens } from "../utils/tokens.js";

/**
 * Analyzes code content for LOC, blank, comments, complexity, and tokens.
 */
export function analyzeContent(content, langInfo = {}) {
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  
  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;
  let complexity = 1; // Base complexity
  let maxNesting = 0;
  let currentNesting = 0;

  const singleComment = langInfo.commentSingle;
  const blockCommentStart = langInfo.commentBlock ? langInfo.commentBlock[0] : null;
  const blockCommentEnd = langInfo.commentBlock ? langInfo.commentBlock[1] : null;

  let inBlockComment = false;

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      blankLines++;
      continue;
    }

    // Block comment tracking
    if (inBlockComment) {
      commentLines++;
      if (blockCommentEnd && trimmed.includes(blockCommentEnd)) {
        inBlockComment = false;
      }
      continue;
    }

    if (blockCommentStart && trimmed.startsWith(blockCommentStart)) {
      commentLines++;
      if (!blockCommentEnd || !trimmed.includes(blockCommentEnd, blockCommentStart.length)) {
        inBlockComment = true;
      }
      continue;
    }

    // Single line comment
    if (singleComment && trimmed.startsWith(singleComment)) {
      commentLines++;
      continue;
    }

    codeLines++;

    // Track indentation / nesting depth
    const leadingSpaces = line.search(/\S|$/);
    const indentDepth = Math.floor(leadingSpaces / 2);
    if (indentDepth > maxNesting) {
      maxNesting = indentDepth;
    }

    // Complexity heuristic for code types:
    // Count branching constructs
    if (langInfo.type === "code") {
      const branchMatches = line.match(/\b(if|else\s+if|for|while|switch|case|catch|&&|\|\||\?)\b/g);
      if (branchMatches) {
        complexity += branchMatches.length;
      }
    }
  }

  const tokens = estimateTokens(content);

  return {
    lines: totalLines,
    code: codeLines,
    comments: commentLines,
    blanks: blankLines,
    complexity,
    maxNesting,
    tokens
  };
}
