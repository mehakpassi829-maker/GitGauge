/**
 * GitGauge — Developer Intelligence Platform
 * Client-side Controller & Visualization Engine
 */

const ANALYZERS = {
    commit: {
        label: "Commit Intelligence",
        key: "commit_score",
        color: "#5bb89a",
        barId: "commitBar",
        elId: "commitScore",
        desc: "Commit frequency, consistency streaks, active days, and message quality"
    },
    architect: {
        label: "Architecture Intelligence",
        key: "architect_score",
        color: "#6b94c9",
        barId: "archBar",
        elId: "archScore",
        desc: "Repository organization, modular separation, and dependency management"
    },
    algorithm: {
        label: "Algorithm Intelligence",
        key: "algorithm_score",
        color: "#5db8c4",
        barId: "techBar",
        elId: "techScore",
        desc: "Algorithmic patterns, complexity, logic, and optimization indicators"
    },
    collaboration: {
        label: "Collaboration Intelligence",
        key: "collaboration_score",
        color: "#c47f98",
        barId: "collabBar",
        elId: "collaboration_score",
        desc: "Pull requests, code reviews, issue engagement, and teamwork signals"
    },
    documentation: {
        label: "Documentation Intelligence",
        key: "documentation_score",
        color: "#8a82c8",
        barId: "docBar",
        elId: "docScore",
        desc: "README completeness, setup guides, code comments, and project clarity"
    },
    developer: {
        label: "Developer Growth",
        key: "developer_score",
        color: "#c9a35a",
        barId: "devBar",
        elId: "growthScore",
        desc: "Technology expansion, learning speed, and consistency over time"
    }
};

const METRIC_LABELS = {
    frequency: "Frequency",
    consistency: "Consistency",
    active_days: "Active Days",
    msg_quality: "Message Quality",
    time_dist: "Time Distribution",
    streak: "Streak",
    folder_structure: "Folder Structure",
    modularity: "Modularity",
    dependencies: "Dependencies",
    scalability: "Scalability",
    reusability: "Reusability",
    config_handling: "Config Handling",
    algo_usage: "Algorithm Usage",
    efficiency: "Efficiency",
    logic_complexity: "Logic Complexity",
    data_structures: "Data Structures",
    optimization: "Optimization",
    edge_cases: "Edge Cases",
    pull_requests: "Pull Requests",
    acceptance_rate: "Acceptance Rate",
    issues: "Issues",
    code_reviews: "Code Reviews",
    contributions: "Contributions",
    oss_activity: "OSS Activity",
    readme_quality: "README Quality",
    setup_guide: "Setup Guide",
    code_comments: "Code Comments",
    structure: "Structure",
    visuals: "Visuals",
    api_docs: "API Docs",
    growth_trajectory: "Growth Trajectory",
    complexity_increase: "Complexity Increase",
    tech_expansion: "Tech Expansion",
    learning_speed: "Learning Speed",
    experimentation: "Experimentation"
};

const SUB_METRIC_WEIGHTS = {
    frequency: 20, consistency: 25, active_days: 15, msg_quality: 20, time_dist: 10, streak: 10,
    folder_structure: 20, modularity: 25, dependencies: 15, scalability: 20, reusability: 10, config_handling: 10,
    algo_usage: 25, efficiency: 20, logic_complexity: 20, data_structures: 20, optimization: 10, edge_cases: 5,
    pull_requests: 20, acceptance_rate: 25, issues: 15, code_reviews: 20, contributions: 10, oss_activity: 10,
    readme_quality: 30, setup_guide: 20, code_comments: 20, structure: 15, visuals: 10, api_docs: 5,
    growth_trajectory: 25, complexity_increase: 20, tech_expansion: 20, learning_speed: 10, experimentation: 10
};

const LANG_COLORS = {
    Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#2b7489",
    "C#": "#178600", Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8",
    Rust: "#dea584", HTML: "#e34c26", CSS: "#563d7c", Kotlin: "#A97BFF",
    "Jupyter Notebook": "#DA5B0B", Ruby: "#701516", PHP: "#4F5D95",
    Shell: "#89e051", C: "#555555", Unknown: "#737E8C"
};

let radarInst = null;
let scoreTimer = null;
let analyzerData = {};
let currentActiveKey = null;

/**
 * Main Analysis Orchestrator
 */
async function analyzeUser(customUser) {
    const heroInput = document.getElementById("username");
    const topInput = document.getElementById("topbarUsername");

    let u = (customUser || "").trim();
    if (!u) {
        if (heroInput && heroInput.value.trim()) {
            u = heroInput.value.trim();
        } else if (topInput && topInput.value.trim()) {
            u = topInput.value.trim();
        }
    }
    if (!u) return;

    if (heroInput) heroInput.value = u;
    if (topInput) topInput.value = u;

    const resultEl = document.getElementById("result");
    const loadingEl = document.getElementById("loading");
    const heroEl = document.getElementById("heroText");

    if (resultEl) resultEl.classList.add("hidden");
    if (loadingEl) loadingEl.classList.remove("hidden");
    closeBreakdown();

    try {
        const res = await fetch("/analyze/" + encodeURIComponent(u));
        if (!res.ok) {
            throw new Error(res.status === 404 ? "User or public repositories not found" : "Analysis request failed");
        }
        const data = await res.json();
        if (loadingEl) loadingEl.classList.add("hidden");

        if (data.error) {
            alert(data.error);
            return;
        }

        analyzerData = data.analyzers;

        // Dynamic Header
        const welcomeHeading = document.getElementById("welcomeHeading");
        if (welcomeHeading) {
            const login = data.user_info ? data.user_info.login : u;
            welcomeHeading.textContent = "Welcome back — @" + login + "'s snapshot";
        }

        const fetchTimestamp = document.getElementById("fetchTimestamp");
        if (fetchTimestamp) {
            const now = new Date();
            fetchTimestamp.textContent = "Last fetched: " + now.toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
            });
        }

        // Render Dashboard Visualizations
        renderUserInfo(data.user_info);
        renderScoreRing(data.hireability.score, data.hireability.grade, data.hireability.label);
        renderCards(data.analyzers);
        renderRadar(data.analyzers);
        renderInsights(data.analyzers);
        renderRepos(data.repos);

        if (heroEl) heroEl.classList.add("hidden");
        if (resultEl) resultEl.classList.remove("hidden");

        // Scroll smoothly to result
        resultEl.scrollIntoView({ behavior: "smooth" });

    } catch (e) {
        if (loadingEl) loadingEl.classList.add("hidden");
        console.error("Analysis Error:", e);
        alert("Failed to analyze @" + u + ": " + (e.message || "Please check the username and try again."));
    }
}

/**
 * Developer Profile Card
 */
function renderUserInfo(info) {
    const container = document.getElementById("userInfo");
    if (!container || !info) return;

    const avatarUrl = info.avatar_url || "https://github.com/ghost.png";
    const name = info.name || info.login || "Developer";
    const handle = info.login ? "@" + info.login : "";
    const repos = info.public_repos || 0;
    const followers = info.followers || 0;
    const following = info.following || 0;
    const bio = info.bio ? '<span class="bio">' + escapeHtml(info.bio) + '</span>' : '';

    container.innerHTML =
        '<div class="user-profile">' +
            '<img src="' + avatarUrl + '" class="avatar" alt="' + escapeHtml(name) + '" loading="lazy" />' +
            '<div class="user-profile-info">' +
                '<strong>' + escapeHtml(name) + '</strong>' +
                '<span class="handle">' + escapeHtml(handle) + '</span>' +
                '<span class="stats">' + repos + ' repos · ' + followers + ' followers · ' + following + ' following</span>' +
                bio +
            '</div>' +
        '</div>';
}

/**
 * Circular Hireability Score Ring
 */
function renderScoreRing(score, grade, label) {
    const canvas = document.getElementById("scoreCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = 70, cy = 70, r = 56;

    if (scoreTimer) clearInterval(scoreTimer);
    let cur = 0;
    const target = Math.min(Math.max(score, 0), 100);

    scoreTimer = setInterval(function() {
        ctx.clearRect(0, 0, 140, 140);

        // Background track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#191c24";
        ctx.lineWidth = 9;
        ctx.stroke();

        // Animated progress arc
        const end = (cur / 100) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, end);
        ctx.strokeStyle = cur >= 75 ? "#5bb89a" : cur >= 50 ? "#c9a35a" : "#c47f98";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.stroke();

        const numEl = document.getElementById("scoreNumber");
        if (numEl) numEl.textContent = cur;

        if (cur >= target) {
            clearInterval(scoreTimer);
            const gradeEl = document.getElementById("scoreGrade");
            if (gradeEl) {
                gradeEl.textContent = (grade || "B") + " · " + (label || "Developing");
            }
        }
        cur++;
    }, 14);
}

/**
 * Six Analyzer Scorecards
 */
function renderCards(a) {
    for (const key in ANALYZERS) {
        const cfg = ANALYZERS[key];
        if (!a[key]) continue;
        const score = a[key][cfg.key] || 0;

        const el = document.getElementById(cfg.elId);
        if (el) el.textContent = score + "%";

        const bar = document.getElementById(cfg.barId);
        if (bar) {
            setTimeout(function() {
                bar.style.width = score + "%";
            }, 180);
        }
    }
}

/**
 * Performance Radar Chart (Chart.js)
 */
function renderRadar(a) {
    const canvas = document.getElementById("radarChart");
    if (!canvas) return;

    if (radarInst) radarInst.destroy();

    const scores = [];
    const colors = [];
    for (const key in ANALYZERS) {
        scores.push(a[key] ? a[key][ANALYZERS[key].key] : 0);
        colors.push(ANALYZERS[key].color);
    }

    radarInst = new Chart(canvas, {
        type: "radar",
        data: {
            labels: ["Commit", "Architecture", "Algorithm", "Collaboration", "Documentation", "Growth"],
            datasets: [{
                data: scores,
                backgroundColor: "rgba(91, 184, 154, 0.08)",
                borderColor: "#5bb89a",
                borderWidth: 1.6,
                pointBackgroundColor: colors,
                pointBorderColor: "#12141a",
                pointBorderWidth: 1.5,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#191c24",
                    titleColor: "#f0f0f5",
                    bodyColor: "#8b8fa3",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false, stepSize: 25 },
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    angleLines: { color: "rgba(255, 255, 255, 0.06)" },
                    pointLabels: {
                        color: "#8b8fa3",
                        font: { size: 11, family: "'Inter', sans-serif", weight: "500" }
                    }
                }
            }
        }
    });
}

/**
 * Detailed Analyzer Breakdown
 */
function showBreakdown(key) {
    currentActiveKey = key;
    const cfg = ANALYZERS[key];
    const d = analyzerData[key];
    if (!d || !cfg) return;

    const score = d[cfg.key] || 0;
    const metrics = d.sub_metrics || {};

    // Generate engine tabs
    let tabsHtml = "";
    for (const k in ANALYZERS) {
        const isActive = k === key;
        const c = ANALYZERS[k].color;
        tabsHtml += '<button type="button" class="bd-tab' + (isActive ? " active" : "") + '" data-key="' + k + '"' +
            (isActive ? ' style="border-color:' + c + ';color:' + c + '"' : '') + '>' +
            '<span class="bd-tab-dot" style="background:' + c + '"></span>' +
            ANALYZERS[k].label.replace(" Intelligence", "").replace(" Analyzer", "") +
            '</button>';
    }

    // Generate metrics list
    let metricsHtml = "";
    const formulaParts = [];
    const barLabels = [];
    const barValues = [];
    const donutValues = [];

    for (const mk in metrics) {
        const mv = metrics[mk];
        const w = SUB_METRIC_WEIGHTS[mk] || 15;
        const lbl = METRIC_LABELS[mk] || mk;

        barLabels.push(lbl.split(" ")[0]);
        barValues.push(mv);
        donutValues.push(w);

        metricsHtml += '<div class="bd-row">' +
            '<span class="bd-lbl">' + escapeHtml(lbl) + '</span>' +
            '<span class="bd-w">' + w + '% weight</span>' +
            '<div class="bd-bar-wrap"><div class="bd-bar" style="width:' + mv + '%;background:' + cfg.color + '"></div></div>' +
            '<span class="bd-val">' + mv + '/100</span>' +
            '</div>';

        formulaParts.push('(' + mv + ' × ' + w + '%)');
    }

    // Engine automated findings
    const findings = generateEngineFindings(key, d, score);
    let findingsHtml = '<div class="bd-findings"><h4>✦ Automated Observations</h4>';
    for (let f = 0; f < findings.length; f++) {
        findingsHtml += '<div class="finding-item"><span class="finding-bullet">✦</span><span>' + findings[f] + '</span></div>';
    }
    findingsHtml += '</div>';

    // Update Header
    const titleEl = document.getElementById("breakdownTitle");
    if (titleEl) titleEl.textContent = cfg.label + " Report";

    const badgeEl = document.getElementById("breakdownScore");
    if (badgeEl) {
        badgeEl.textContent = score + " / 100";
        badgeEl.style.color = cfg.color;
    }

    // Populate Container
    const metricsContainer = document.getElementById("breakdownMetrics");
    if (metricsContainer) {
        metricsContainer.innerHTML =
            '<div class="bd-tabs" id="bdTabs">' + tabsHtml + '</div>' +
            '<p style="font-size:13px;color:var(--muted);margin-bottom:16px;">' + cfg.desc + '</p>' +
            '<div class="bd-metrics">' + metricsHtml + '</div>' +
            '<div class="bd-charts">' +
                '<div class="bd-chart-box">' +
                    '<div class="bd-chart-title">Sub-metric Scores</div>' +
                    '<div style="position:relative;height:180px;"><canvas id="bdBarChart"></canvas></div>' +
                '</div>' +
                '<div class="bd-chart-box">' +
                    '<div class="bd-chart-title">Weight Distribution</div>' +
                    '<div style="display:flex;align-items:center;gap:16px;">' +
                        '<div style="position:relative;height:180px;width:160px;flex-shrink:0;"><canvas id="bdDonutChart"></canvas></div>' +
                        '<div id="bdDonutLegend" class="bd-legend"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="bd-formula">' + formulaParts.join(" + ") + ' = <strong>' + score + '/100</strong></div>' +
            findingsHtml;
    }

    const panel = document.getElementById("breakdownPanel");
    if (panel) {
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth" });
    }

    // Sub-metric Bar Chart
    if (window.bdBarInst) window.bdBarInst.destroy();
    const barCanvas = document.getElementById("bdBarChart");
    if (barCanvas) {
        window.bdBarInst = new Chart(barCanvas, {
            type: "bar",
            data: {
                labels: barLabels,
                datasets: [{
                    data: barValues,
                    backgroundColor: cfg.color + "99",
                    borderColor: cfg.color,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: "#8b8fa3", font: { size: 10 } }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: "rgba(255,255,255,0.05)" },
                        ticks: { color: "#8b8fa3", font: { size: 10 }, stepSize: 25 },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // Donut Chart
    if (window.bdDonutInst) window.bdDonutInst.destroy();
    const donutCanvas = document.getElementById("bdDonutChart");
    if (donutCanvas) {
        const donutColors = [
            cfg.color,
            cfg.color + "cc",
            cfg.color + "99",
            cfg.color + "77",
            cfg.color + "55",
            cfg.color + "33"
        ];
        window.bdDonutInst = new Chart(donutCanvas, {
            type: "doughnut",
            data: {
                labels: barLabels,
                datasets: [{
                    data: donutValues,
                    backgroundColor: donutColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: { legend: { display: false } }
            }
        });

        // Donut Legend
        let legendHtml = "";
        for (let i = 0; i < barLabels.length; i++) {
            legendHtml += '<div class="bd-legend-item">' +
                '<span style="width:8px;height:8px;border-radius:2px;background:' + donutColors[i] + ';display:inline-block;margin-right:6px;"></span>' +
                barLabels[i] + ' ' + donutValues[i] + '%' +
                '</div>';
        }
        const legendEl = document.getElementById("bdDonutLegend");
        if (legendEl) legendEl.innerHTML = legendHtml;
    }

    // Tab click delegation
    const tabsContainer = document.getElementById("bdTabs");
    if (tabsContainer) {
        tabsContainer.addEventListener("click", function(e) {
            const btn = e.target.closest(".bd-tab");
            if (btn) {
                const newKey = btn.getAttribute("data-key");
                if (newKey && newKey !== key) showBreakdown(newKey);
            }
        });
    }
}

function generateEngineFindings(key, data, score) {
    const findings = [];
    if (key === "commit") {
        if (score >= 70) findings.push("Consistent multi-week commit cadence across the public repository catalog.");
        else findings.push("Commit activity shows periodic gaps; increasing regular weekly pushes would strengthen cadence.");
        findings.push("Message discipline evaluates semantic quality without relying on superficial keywords.");
    } else if (key === "architect") {
        if (score >= 70) findings.push("Structured folder hierarchy indicating clean separation of concerns.");
        else findings.push("Flat directory structures detected; nesting components into modular packages is recommended.");
        findings.push("Dependency manifests and licensing files checked for production readiness.");
    } else if (key === "algorithm") {
        if (score >= 70) findings.push("Demonstrated use of data structures and problem-solving algorithm implementations.");
        else findings.push("Opportunity to highlight structured computational algorithms and system language repositories.");
        findings.push("Language complexity and code volume weighted based on observable technical rigor.");
    } else if (key === "collaboration") {
        if (score >= 70) findings.push("Active participation in multi-contributor repositories, forks, and code reviews.");
        else findings.push("Activity is primarily solo-authored; contributing to open-source pull requests will boost signal.");
        findings.push("Teamwork footprint measured via PR velocity, issue engagement, and community stars.");
    } else if (key === "documentation") {
        if (score >= 70) findings.push("Comprehensive README overviews, setup guidelines, and clear project structure.");
        else findings.push("Several repositories lack descriptive README files or execution instructions.");
        findings.push("Documentation clarity signals inspected across all public repository overviews.");
    } else if (key === "developer") {
        if (score >= 70) findings.push("Strong trajectory of continuous experimentation across multiple programming ecosystems.");
        else findings.push("Technical breadth is focused on a core stack; expanding language breadth demonstrates growth.");
        findings.push("Tracks project complexity expansion and multi-year GitHub development consistency.");
    }
    return findings;
}

function closeBreakdown() {
    const panel = document.getElementById("breakdownPanel");
    if (panel) panel.classList.add("hidden");
    currentActiveKey = null;
}

/**
 * Top AI Insights (Strengths & Areas to Improve)
 */
function renderInsights(a) {
    const scores = [];
    for (const key in ANALYZERS) {
        if (a[key]) {
            scores.push({
                label: ANALYZERS[key].label,
                score: a[key][ANALYZERS[key].key] || 0,
                color: ANALYZERS[key].color
            });
        }
    }
    scores.sort(function(x, y) { return y.score - x.score; });

    let sHtml = "", wHtml = "";
    const topCount = Math.min(3, scores.length);
    for (let i = 0; i < topCount; i++) {
        sHtml += '<div class="insight-item">' +
            '<span class="insight-dot" style="background:' + scores[i].color + '"></span>' +
            '<span><strong>' + scores[i].label + '</strong> — scored ' + scores[i].score + '%, strong demonstrated capability</span>' +
            '</div>';
    }

    for (let j = scores.length - 1; j >= Math.max(0, scores.length - 3); j--) {
        wHtml += '<div class="insight-item">' +
            '<span class="insight-dot" style="background:#c47f98"></span>' +
            '<span><strong>' + scores[j].label + '</strong> — scored ' + scores[j].score + '%, primary area for growth</span>' +
            '</div>';
    }

    const sEl = document.getElementById("strengths");
    if (sEl) sEl.innerHTML = sHtml;

    const wEl = document.getElementById("weaknesses");
    if (wEl) wEl.innerHTML = wHtml;
}

/**
 * Repositories Grid
 */
function renderRepos(repos) {
    const container = document.getElementById("repoList");
    if (!container) return;

    if (!repos || !repos.length) {
        container.innerHTML = '<div style="color:var(--dim);font-size:13px;padding:12px;">No public repositories available.</div>';
        return;
    }

    let html = "";
    for (let i = 0; i < repos.length; i++) {
        const r = repos[i];
        const lang = r.language || "Unknown";
        const dotColor = LANG_COLORS[lang] || "#737E8C";
        const langBadge = '<span class="repo-lang"><span class="lang-dot" style="background:' + dotColor + '"></span>' + escapeHtml(lang) + '</span>';
        const desc = r.description ? '<div class="repo-desc">' + escapeHtml(r.description) + '</div>' : '';

        html += '<a href="' + (r.url || '#') + '" target="_blank" rel="noopener noreferrer" class="repo-card">' +
            '<div class="repo-name">' + escapeHtml(r.name || "repository") + '</div>' +
            desc +
            '<div class="repo-footer">' +
                '<div class="repo-meta">' +
                    '<span class="repo-stat">⭐ ' + (r.stars || 0) + '</span>' +
                    '<span class="repo-stat">🍴 ' + (r.forks || 0) + '</span>' +
                '</div>' +
                langBadge +
            '</div>' +
        '</a>';
    }
    container.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Event Listeners & Initialization
 */
document.addEventListener("DOMContentLoaded", function() {

    // Enter key inside search fields
    const usernameInput = document.getElementById("username");
    if (usernameInput) {
        usernameInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                analyzeUser();
            }
        });
    }

    const topbarInput = document.getElementById("topbarUsername");
    if (topbarInput) {
        topbarInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                analyzeUser();
            }
        });
    }

    // Sidebar collapse toggle
    const toggleBtn = document.getElementById("sidebarToggle");
    const shell = document.getElementById("appShell");
    if (toggleBtn && shell) {
        toggleBtn.addEventListener("click", function() {
            shell.classList.toggle("collapsed");
        });
    }

    // Mobile Hamburger Menu
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("mobile-open");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", function() {
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("active");
        });
    }

    // Auto-close mobile drawer on resize
    window.addEventListener("resize", function() {
        if (window.innerWidth > 760 && sidebar && overlay) {
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("active");
        }
    });

    // Intel Card Click Delegation
    document.addEventListener("click", function(e) {
        const card = e.target.closest(".intel-card");
        if (card) {
            const key = card.getAttribute("data-analyzer");
            if (key && analyzerData[key]) {
                showBreakdown(key);
            }
        }
    });

    // Sidebar Navigation Click Delegation
    document.addEventListener("click", function(e) {
        const nav = e.target.closest("[data-nav]");
        if (!nav) return;
        e.preventDefault();

        const target = nav.getAttribute("data-nav");
        const items = document.querySelectorAll(".nav-item");
        items.forEach(function(item) { item.classList.remove("active"); });
        nav.classList.add("active");

        // Close mobile drawer if open
        if (sidebar && overlay) {
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("active");
        }

        if (target === "overview") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            closeBreakdown();
            return;
        }

        const hasResult = !document.getElementById("result") || !document.getElementById("result").classList.contains("hidden");
        if (!hasResult) {
            const input = document.getElementById("username");
            if (input) input.focus();
            return;
        }

        if (target === "insights") {
            const el = document.getElementById("insightSection") || document.getElementById("analyzerSection");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else if (target === "repos") {
            const el = document.getElementById("repoSection");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else if (ANALYZERS[target] && analyzerData[target]) {
            showBreakdown(target);
        }
    });

    // Check query params (?username=xxx)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryUser = urlParams.get("username");
        if (queryUser) {
            analyzeUser(queryUser);
        }
    } catch (err) {
        console.error("URL Params Parse Error:", err);
    }
});
