/**
 * Lightweight, robust multi-language AST/regex symbol extractor.
 * Extracts functions, classes, exports, and imports without requiring heavy compilers.
 */

export function extractSymbols(content, language = "JavaScript") {
  const symbols = {
    classes: [],
    functions: [],
    imports: [],
    exports: []
  };

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (!line || line.startsWith("//") || line.startsWith("#") || line.startsWith("/*")) {
      continue;
    }

    // 1. Imports / Dependencies
    // JS/TS: import ... from '...' or require('...')
    const esImport = line.match(/^import\s+(?:(?:[\w*\s{},]+)\s+from\s+)?['"]([^'"]+)['"]/);
    if (esImport) {
      symbols.imports.push({ source: esImport[1], line: lineNum });
    }
    const cjsRequire = line.match(/(?:const|let|var)\s+.*=\s*require\(['"]([^'"]+)['"]\)/);
    if (cjsRequire) {
      symbols.imports.push({ source: cjsRequire[1], line: lineNum });
    }
    // Python import
    const pyImport = line.match(/^(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/);
    if (pyImport) {
      symbols.imports.push({ source: pyImport[1] || pyImport[2], line: lineNum });
    }
    // Go import
    const goImport = line.match(/^import\s+(?:\w+\s+)?["']([^"']+)["']/);
    if (goImport) {
      symbols.imports.push({ source: goImport[1], line: lineNum });
    }

    // 2. Classes
    const classMatch = line.match(/\bclass\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$.]+))?/);
    if (classMatch) {
      symbols.classes.push({
        name: classMatch[1],
        extends: classMatch[2] || null,
        line: lineNum
      });
    }

    // 3. Functions
    // JS/TS function or method
    const fnDecl = line.match(/^(?:export\s+)?(?:async\s+)?function(?:\s*\*|\s+)\s*([A-Za-z0-9_$]+)\s*\(([^)]*)\)/);
    if (fnDecl) {
      symbols.functions.push({
        name: fnDecl[1],
        params: fnDecl[2].trim(),
        line: lineNum,
        isExport: line.startsWith("export")
      });
    }

    // Arrow function variable
    const arrowFn = line.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
    if (arrowFn) {
      symbols.functions.push({
        name: arrowFn[1],
        params: arrowFn[2].trim(),
        line: lineNum,
        isExport: line.startsWith("export")
      });
    }

    // Python def
    const pyFn = line.match(/^def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\):/);
    if (pyFn) {
      symbols.functions.push({
        name: pyFn[1],
        params: pyFn[2].trim(),
        line: lineNum,
        isExport: !pyFn[1].startsWith("_")
      });
    }

    // Go func
    const goFn = line.match(/^func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
    if (goFn) {
      symbols.functions.push({
        name: goFn[1],
        params: goFn[2].trim(),
        line: lineNum,
        isExport: /^[A-Z]/.test(goFn[1])
      });
    }

    // 4. Exports
    if (line.startsWith("export default")) {
      const target = line.replace("export default", "").replace(/[;{]/g, "").trim();
      symbols.exports.push({ name: target || "default", isDefault: true, line: lineNum });
    } else if (line.startsWith("export const ") || line.startsWith("export function ") || line.startsWith("export class ")) {
      const match = line.match(/export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/);
      if (match) {
        symbols.exports.push({ name: match[1], isDefault: false, line: lineNum });
      }
    }
  }

  return symbols;
}

/**
 * Generates an LLM-friendly condensed skeleton string of a file
 */
export function generateSkeleton(relPath, content, language) {
  const symbols = extractSymbols(content, language);
  const parts = [];

  parts.push(`📄 ${relPath}`);
  
  if (symbols.imports.length > 0) {
    const importSources = symbols.imports.map((i) => i.source).slice(0, 5);
    const more = symbols.imports.length > 5 ? ` +${symbols.imports.length - 5} more` : "";
    parts.push(`  ├─ 📦 imports: ${importSources.join(", ")}${more}`);
  }

  if (symbols.classes.length > 0) {
    for (const cls of symbols.classes) {
      const extStr = cls.extends ? ` extends ${cls.extends}` : "";
      parts.push(`  ├─ 🏛️ class ${cls.name}${extStr} (L${cls.line})`);
    }
  }

  if (symbols.functions.length > 0) {
    for (const fn of symbols.functions) {
      const expStr = fn.isExport ? " [export]" : "";
      parts.push(`  ├─ ⚡ ${fn.name}(${fn.params})${expStr} (L${fn.line})`);
    }
  }

  if (symbols.exports.length > 0 && symbols.classes.length === 0 && symbols.functions.length === 0) {
    const exps = symbols.exports.map((e) => e.name).join(", ");
    parts.push(`  ├─ 📤 exports: ${exps}`);
  }

  return parts.join("\n");
}
