import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function getGitInfo(rootDir) {
  try {
    if (!existsSync(join(rootDir, ".git"))) {
      return { isGit: false };
    }

    const execOpts = { cwd: rootDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000 };
    
    let branch = "main";
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", execOpts).trim();
    } catch {}

    let commitCount = 0;
    try {
      const countStr = execSync("git rev-list --count HEAD", execOpts).trim();
      commitCount = parseInt(countStr, 10) || 0;
    } catch {}

    let lastCommit = null;
    try {
      const last = execSync("git log -1 --pretty=format:'%h|%an|%cr|%s'", execOpts).trim();
      if (last) {
        const [hash, author, date, message] = last.split("|");
        lastCommit = { hash, author, date, message };
      }
    } catch {}

    let churnMap = {};
    try {
      // Analyze file churn over last 50 commits
      const churnRaw = execSync("git log --name-only --oneline -50", execOpts);
      const lines = churnRaw.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || /^[a-f0-9]{7,}\s/.test(trimmed)) continue;
        churnMap[trimmed] = (churnMap[trimmed] || 0) + 1;
      }
    } catch {}

    return {
      isGit: true,
      branch,
      commitCount,
      lastCommit,
      churnMap
    };
  } catch {
    return { isGit: false };
  }
}
