// Terminal formatting and styling helpers

const enabled = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

function wrap(code, close = 39) {
  return (str) => (enabled ? `\x1b[${code}m${str}\x1b[${close}m` : String(str));
}

export const c = {
  reset: (s) => (enabled ? `\x1b[0m${s}` : String(s)),
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  italic: wrap(3, 23),
  underline: wrap(4, 24),
  
  black: wrap(30),
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  blue: wrap(34),
  magenta: wrap(35),
  cyan: wrap(36),
  white: wrap(37),
  gray: wrap(90),

  bgCyan: wrap(46, 49),
  bgBlue: wrap(44, 49),
  bgMagenta: wrap(45, 49),
  bgGreen: wrap(42, 49),
  bgRed: wrap(41, 49)
};

export function banner() {
  const art = [
    c.cyan("      .---.              "),
    c.cyan("     /  .  \\             ") + c.bold(c.white("  ORCA ")) + c.dim("— Codebase Architecture Radar"),
    c.cyan("    |  /|   |            ") + c.gray("  & Context Engine for AI Coding Agents"),
    c.cyan("    | | |   | ___        "),
    c.cyan("    \\  \\|  / '  _)       ") + c.dim("  v1.0.0 • High-Performance Local CLI"),
    c.cyan("     `---'-\"\"\"\"\"         ")
  ].join("\n");
  return `\n${art}\n`;
}

export function table(headers, rows) {
  const colWidths = headers.map((h, i) => {
    const headerLen = stripAnsi(h).length;
    const maxRowLen = rows.reduce((max, row) => {
      const cell = row[i] !== undefined ? String(row[i]) : "";
      return Math.max(max, stripAnsi(cell).length);
    }, 0);
    return Math.max(headerLen, maxRowLen);
  });

  const sep = "  ";
  const headerLine = headers
    .map((h, i) => pad(h, colWidths[i]))
    .join(sep);
  const dividerLine = colWidths
    .map((w) => "─".repeat(w))
    .join(sep);

  const dataLines = rows.map((row) =>
    row.map((cell, i) => pad(String(cell ?? ""), colWidths[i])).join(sep)
  );

  return [c.bold(headerLine), c.gray(dividerLine), ...dataLines].join("\n");
}

export function pad(str, length) {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= length) return str;
  return str + " ".repeat(length - visibleLen);
}

export function padLeft(str, length) {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= length) return str;
  return " ".repeat(length - visibleLen) + str;
}

export function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, "");
}

export function progressBar(pct, width = 20) {
  const filled = Math.round((pct / 100) * width);
  const empty = Math.max(0, width - filled);
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `${bar} ${pct.toFixed(1)}%`;
}
