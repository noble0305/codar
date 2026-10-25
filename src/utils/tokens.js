// Token estimation and formatting utilities
// Calibrated against OpenAI cl100k_base / Anthropic Claude / Gemini tokenizers

/**
 * Estimates token count for a given text string.
 * Code has a higher token density due to indentation, punctuation, and camelCase identifiers.
 */
export function estimateTokens(text) {
  if (!text) return 0;
  
  // Quick heuristic regex-based BPE simulation:
  // Matches words, numbers, whitespace runs, or single punctuation characters
  const pattern = /[a-zA-Z0-9_]+|[^\s\w]+|\s+/g;
  const matches = text.match(pattern);
  if (!matches) return 0;

  let tokens = 0;
  for (let i = 0; i < matches.length; i++) {
    const segment = matches[i];
    const len = segment.length;
    
    if (/^\s+$/.test(segment)) {
      // Long indentations / whitespace chunks often merge every 4 spaces into 1 token
      tokens += Math.ceil(len / 4);
    } else if (/^[a-zA-Z0-9_]+$/.test(segment)) {
      // Split camelCase or long identifiers into sub-tokens
      // Average English/code word token length is ~4 characters
      if (len <= 4) {
        tokens += 1;
      } else {
        // Check for camelCase or snake_case splits
        const subTokens = segment.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[_\s]+/);
        tokens += Math.max(1, subTokens.length);
      }
    } else {
      // Punctuation characters ({}[]();:=> etc) are usually 1 token each
      tokens += len;
    }
  }

  // Minimum floor check against character count (~3.7 chars / token average)
  const charBased = Math.ceil(text.length / 3.7);
  return Math.round((tokens * 0.7) + (charBased * 0.3));
}

/**
 * Formats token count into human-readable string (e.g. 1.2k, 128k, 1.4M)
 */
export function formatTokens(num) {
  if (num === null || num === undefined) return "0";
  if (num < 1000) return `${num}`;
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(2)}M`;
}

/**
 * Formats byte size into human readable string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
