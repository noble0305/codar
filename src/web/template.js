/**
 * Self-contained HTML/CSS/JS template for Orca Web Dashboard & Exported Reports.
 */
export function renderDashboardHtml(data, isStaticExport = false) {
  const jsonData = JSON.stringify(data).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orca — Codebase Architecture & Context Radar</title>
  <style>
    :root {
      --bg-primary: #0a0f1d;
      --bg-secondary: #111827;
      --bg-card: #162032;
      --bg-card-hover: #1e293b;
      --border: #24324d;
      --accent-cyan: #00f2fe;
      --accent-blue: #4facfe;
      --accent-purple: #9d4edd;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      min-height: 100vh;
    }
    header {
      background: linear-gradient(180deg, rgba(16, 24, 40, 0.95) 0%, rgba(10, 15, 29, 0.9) 100%);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .whale-logo {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.5));
    }
    .logo-title {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 30%, var(--accent-cyan) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-grade-A { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .badge-grade-B { background: rgba(79, 172, 254, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
    .badge-grade-C { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
    .badge-grade-D { background: rgba(244, 63, 94, 0.2); color: #f87171; border: 1px solid #ef4444; }

    nav {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
    }
    .nav-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-btn.active {
      color: var(--accent-cyan);
      background: rgba(0, 242, 254, 0.1);
      box-shadow: inset 0 0 0 1px rgba(0, 242, 254, 0.3);
    }

    main {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .view { display: none; }
    .view.active { display: block; }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      border-color: rgba(0, 242, 254, 0.4);
      transform: translateY(-2px);
    }
    .card-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .card-sub {
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-top: 0.35rem;
    }

    /* Distribution Bar */
    .dist-bar {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      margin: 1rem 0;
      background: #1f293d;
    }
    .dist-segment {
      height: 100%;
      transition: width 0.3s;
    }

    /* Tables */
    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 2rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    th {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-main);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg-card-hover); }

    .search-input {
      background: #0f172a;
      border: 1px solid var(--border);
      color: #fff;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2);
    }

    /* Context Packager */
    .packager-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .budget-slider-box {
      margin: 1.5rem 0;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }
    .btn {
      background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);
      color: #04101f;
      font-weight: 600;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      transition: opacity 0.2s, transform 0.1s;
    }
    .btn:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-secondary {
      background: #25334c;
      color: #fff;
    }
    .btn-secondary:hover { background: #324363; }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      display: none;
      z-index: 100;
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-container">
      <span class="whale-logo">🐋</span>
      <div>
        <div class="logo-title">ORCA ARCHITECTURE RADAR</div>
        <div style="font-size: 0.75rem; color: var(--text-dim);" id="header-meta"></div>
      </div>
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <span id="grade-badge" class="badge"></span>
      <button class="btn btn-secondary" onclick="exportDataJson()">Export JSON</button>
    </div>
  </header>

  <nav>
    <button class="nav-btn active" onclick="switchTab('overview')">📊 Overview</button>
    <button class="nav-btn" onclick="switchTab('map')">🗺️ Codebase Map</button>
    <button class="nav-btn" onclick="switchTab('context')">⚡ AI Context Packager</button>
    <button class="nav-btn" onclick="switchTab('hotspots')">🎯 Risk & Hotspots</button>
  </nav>

  <main>
    <!-- OVERVIEW VIEW -->
    <div id="view-overview" class="view active">
      <div class="kpi-grid">
        <div class="card">
          <div class="card-label">Total Codebase Tokens</div>
          <div class="card-value" id="kpi-tokens" style="color: var(--accent-cyan);">-</div>
          <div class="card-sub" id="kpi-token-sub">Estimated LLM footprint</div>
        </div>
        <div class="card">
          <div class="card-label">Lines of Code</div>
          <div class="card-value" id="kpi-loc">-</div>
          <div class="card-sub" id="kpi-loc-sub">Total lines</div>
        </div>
        <div class="card">
          <div class="card-label">Files & Modules</div>
          <div class="card-value" id="kpi-files">-</div>
          <div class="card-sub" id="kpi-files-sub">-</div>
        </div>
        <div class="card">
          <div class="card-label">Architecture Health</div>
          <div class="card-value" id="kpi-score" style="color: var(--accent-emerald);">-</div>
          <div class="card-sub" id="kpi-score-sub">Health Index</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Language Breakdown</h3>
        <div class="dist-bar" id="lang-bar"></div>
        <div id="lang-legend" style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem;"></div>
      </div>

      <div class="card">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Top Context-Heavy Files</h3>
        <div class="table-container" style="margin-bottom: 0;">
          <table>
            <thead>
              <tr>
                <th>File Path</th>
                <th>Language</th>
                <th>Lines</th>
                <th>Complexity</th>
                <th>Estimated Tokens</th>
              </tr>
            </thead>
            <tbody id="top-files-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CODEBASE MAP VIEW -->
    <div id="view-map" class="view">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <input type="text" id="map-search" class="search-input" placeholder="Search files or modules..." oninput="filterFiles()">
        <span style="font-size: 0.85rem; color: var(--text-muted);" id="file-count-label"></span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Language</th>
              <th>Code / Blanks / Comments</th>
              <th>Complexity</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody id="all-files-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- AI CONTEXT PACKAGER VIEW -->
    <div id="view-context" class="view">
      <div class="packager-box">
        <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--accent-cyan);">⚡ Interactive AI Context Packager</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Select target modules to assemble an optimal, token-budgeted prompt context for Gemini, Claude, or GPT-4.
        </p>

        <div class="budget-slider-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
            <span>Token Budget: <strong id="budget-label" style="color: var(--accent-cyan);">16,000 tokens</strong></span>
            <span id="selected-summary" style="color: var(--text-muted);">0 files selected</span>
          </div>
          <input type="range" id="budget-range" min="4000" max="64000" step="4000" value="16000" style="width: 100%;" oninput="updateBudget(this.value)">
        </div>

        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
          <button class="btn btn-secondary" onclick="quickSelect(5)">Select Top 5 Files</button>
          <button class="btn btn-secondary" onclick="clearSelection()">Clear Selection</button>
          <button class="btn" onclick="copyContextBundle()">📋 Copy Markdown Context</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th width="40"><input type="checkbox" id="select-all-box" onchange="toggleSelectAll(this.checked)"></th>
                <th>File Path</th>
                <th>Language</th>
                <th>Lines</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody id="packager-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- RISK & HOTSPOTS VIEW -->
    <div id="view-hotspots" class="view">
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Architectural Risk Radar</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
          Files with high cyclomatic complexity and high modification frequency represent top defect hotspots.
        </p>
        <div class="table-container" style="margin-bottom: 0;">
          <table>
            <thead>
              <tr>
                <th>File Path</th>
                <th>Complexity</th>
                <th>Git Churn</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="hotspots-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Recommendations</h3>
        <ul id="recommendations-list" style="padding-left: 1.25rem; color: var(--text-muted); font-size: 0.9rem; line-height: 1.8;"></ul>
      </div>
    </div>
  </main>

  <div id="toast"></div>

  <script>
    const DATA = ${jsonData};
    const COLORS = ["#00f2fe", "#4facfe", "#9d4edd", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899"];

    let selectedFiles = new Set();
    let currentBudget = 16000;

    function formatNumber(n) {
      return (n || 0).toLocaleString();
    }

    function formatTokenString(n) {
      if (!n) return "0";
      if (n < 1000) return n + "";
      if (n < 1000000) return (n / 1000).toFixed(1) + "k";
      return (n / 1000000).toFixed(2) + "M";
    }

    function init() {
      const scan = DATA.scan;
      const audit = DATA.audit;

      // Meta & Badge
      document.getElementById("header-meta").innerText = scan.rootDir + " • Scanned " + new Date().toLocaleTimeString();
      const grade = audit.grade || "A";
      const badge = document.getElementById("grade-badge");
      badge.innerText = "Health Grade " + grade;
      badge.className = "badge badge-grade-" + grade;

      // KPIs
      document.getElementById("kpi-tokens").innerText = formatTokenString(scan.totalTokens);
      document.getElementById("kpi-token-sub").innerText = formatNumber(scan.totalTokens) + " raw tokens";
      document.getElementById("kpi-loc").innerText = formatNumber(scan.totalLines);
      document.getElementById("kpi-loc-sub").innerText = formatNumber(scan.totalCode) + " code, " + formatNumber(scan.totalComments) + " comments";
      document.getElementById("kpi-files").innerText = scan.fileCount;
      document.getElementById("kpi-files-sub").innerText = scan.dirCount + " directories";
      document.getElementById("kpi-score").innerText = audit.healthScore + "/100";
      document.getElementById("kpi-score-sub").innerText = audit.totalIssues + " potential warnings";

      // Languages
      renderLanguages(scan.languages, scan.totalLines);

      // Top Files Table
      renderTopFiles(scan.files.slice(0, 8));

      // Map View
      renderAllFiles(scan.files);

      // Packager View
      renderPackagerFiles(scan.files);

      // Hotspots View
      renderHotspots(audit.hotspots, audit.recommendations);
    }

    function renderLanguages(languages, totalLines) {
      const bar = document.getElementById("lang-bar");
      const legend = document.getElementById("lang-legend");
      bar.innerHTML = "";
      legend.innerHTML = "";

      let idx = 0;
      const sorted = Object.entries(languages).sort((a, b) => b[1].lines - a[1].lines);

      for (const [lang, stats] of sorted) {
        const pct = totalLines > 0 ? ((stats.lines / totalLines) * 100).toFixed(1) : 0;
        const color = COLORS[idx % COLORS.length];

        const seg = document.createElement("div");
        seg.className = "dist-segment";
        seg.style.width = pct + "%";
        seg.style.background = color;
        seg.title = lang + ": " + pct + "% (" + stats.lines + " lines)";
        bar.appendChild(seg);

        const leg = document.createElement("div");
        leg.innerHTML = \`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:\${color};margin-right:6px;"></span>\${lang} <span style="color:var(--text-dim)">(\${pct}%)</span>\`;
        legend.appendChild(leg);

        idx++;
      }
    }

    function renderTopFiles(files) {
      const tbody = document.getElementById("top-files-tbody");
      tbody.innerHTML = files.map(f => \`
        <tr>
          <td><strong style="color: var(--accent-cyan)">\${f.path}</strong></td>
          <td><span style="color: var(--text-muted)">\${f.language}</span></td>
          <td>\${formatNumber(f.lines)}</td>
          <td>\${f.complexity}</td>
          <td><strong style="color: #60a5fa">\${formatTokenString(f.tokens)}</strong></td>
        </tr>
      \`).join("");
    }

    function renderAllFiles(files) {
      const tbody = document.getElementById("all-files-tbody");
      document.getElementById("file-count-label").innerText = "Showing " + files.length + " files";
      tbody.innerHTML = files.map(f => \`
        <tr>
          <td><code>\${f.path}</code></td>
          <td>\${f.language}</td>
          <td>\${f.code} <span style="color:var(--text-dim)">/ \${f.blanks} / \${f.comments}</span></td>
          <td>\${f.complexity}</td>
          <td>\${formatTokenString(f.tokens)}</td>
        </tr>
      \`).join("");
    }

    function filterFiles() {
      const query = document.getElementById("map-search").value.toLowerCase();
      const filtered = DATA.scan.files.filter(f => f.path.toLowerCase().includes(query) || f.language.toLowerCase().includes(query));
      renderAllFiles(filtered);
    }

    function renderPackagerFiles(files) {
      const tbody = document.getElementById("packager-tbody");
      tbody.innerHTML = files.map(f => \`
        <tr>
          <td><input type="checkbox" class="file-chk" data-path="\${f.path}" data-tokens="\${f.tokens}" \${selectedFiles.has(f.path) ? "checked" : ""} onchange="toggleFileSelection('\${f.path}', this.checked)"></td>
          <td><code>\${f.path}</code></td>
          <td>\${f.language}</td>
          <td>\${f.lines}</td>
          <td>\${formatTokenString(f.tokens)}</td>
        </tr>
      \`).join("");
      updateSelectionSummary();
    }

    function toggleFileSelection(path, isChecked) {
      if (isChecked) selectedFiles.add(path);
      else selectedFiles.delete(path);
      updateSelectionSummary();
    }

    function toggleSelectAll(isChecked) {
      document.querySelectorAll(".file-chk").forEach(chk => {
        chk.checked = isChecked;
        const p = chk.getAttribute("data-path");
        if (isChecked) selectedFiles.add(p);
        else selectedFiles.delete(p);
      });
      updateSelectionSummary();
    }

    function quickSelect(n) {
      selectedFiles.clear();
      DATA.scan.files.slice(0, n).forEach(f => selectedFiles.add(f.path));
      renderPackagerFiles(DATA.scan.files);
    }

    function clearSelection() {
      selectedFiles.clear();
      renderPackagerFiles(DATA.scan.files);
    }

    function updateBudget(val) {
      currentBudget = parseInt(val, 10);
      document.getElementById("budget-label").innerText = formatNumber(currentBudget) + " tokens";
      updateSelectionSummary();
    }

    function updateSelectionSummary() {
      let totalSelectedTokens = 0;
      DATA.scan.files.forEach(f => {
        if (selectedFiles.has(f.path)) totalSelectedTokens += f.tokens;
      });
      const pct = Math.round((totalSelectedTokens / currentBudget) * 100);
      document.getElementById("selected-summary").innerText = selectedFiles.size + " files selected (~" + formatTokenString(totalSelectedTokens) + " tokens, " + pct + "% of budget)";
    }

    function copyContextBundle() {
      if (selectedFiles.size === 0) {
        showToast("⚠️ Please select at least one file to assemble context.");
        return;
      }
      const files = Array.from(selectedFiles);
      const text = "<!-- ORCA CONTEXT BUNDLE: " + files.length + " files -->\\n" + files.map(f => "### File: " + f).join("\\n");
      navigator.clipboard.writeText(text).then(() => {
        showToast("✓ Context bundle copied to clipboard!");
      }).catch(() => {
        showToast("✓ Selected " + files.length + " files.");
      });
    }

    function renderHotspots(hotspots, recs) {
      const tbody = document.getElementById("hotspots-tbody");
      if (!hotspots || hotspots.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;color:var(--accent-emerald)'>🎉 No high-risk hotspots detected!</td></tr>";
      } else {
        tbody.innerHTML = hotspots.map(h => \`
          <tr>
            <td><code>\${h.path}</code></td>
            <td>\${h.complexity}</td>
            <td>\${h.churn} commits</td>
            <td><strong style="color:var(--accent-rose)">\${h.riskScore}</strong></td>
            <td><span class="badge badge-grade-D">Review</span></td>
          </tr>
        \`).join("");
      }

      const recsList = document.getElementById("recommendations-list");
      recsList.innerHTML = recs.map(r => "<li>" + r + "</li>").join("");
    }

    function switchTab(tabId) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      event.currentTarget.classList.add("active");
      document.getElementById("view-" + tabId).classList.add("active");
    }

    function exportDataJson() {
      const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orca-analysis.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    function showToast(msg) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.style.display = "block";
      setTimeout(() => { toast.style.display = "none"; }, 3000);
    }

    window.onload = init;
  </script>
</body>
</html>`;
}
