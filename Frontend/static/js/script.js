const ANALYZERS = {
    commit:        { label:"Commit Analyzer",        key:"commit_score",        color:"#1D9E75", barId:"commitBar",    elId:"commitScore"         },
    architect:     { label:"Architect Analyzer",     key:"architect_score",     color:"#378ADD", barId:"archBar",      elId:"archScore"           },
    algorithm:     { label:"Algorithm Analyzer",     key:"algorithm_score",     color:"#00BCD4", barId:"techBar",      elId:"techScore"           },
    collaboration: { label:"Collaboration Analyzer", key:"collaboration_score", color:"#D4537E", barId:"collabBar",    elId:"collaboration_score" },
    documentation: { label:"Documentation Analyzer", key:"documentation_score", color:"#7F77DD", barId:"docBar",       elId:"docScore"            },
    developer:     { label:"Developer Analyzer",     key:"developer_score",     color:"#00897B", barId:"devBar",       elId:"growthScore"         },
};
 
const METRIC_LABELS = {
    frequency:"Frequency", consistency:"Consistency", active_days:"Active Days",
    msg_quality:"Message Quality", time_dist:"Time Distribution", streak:"Streak",
    folder_structure:"Folder Structure", modularity:"Modularity", dependencies:"Dependencies",
    scalability:"Scalability", reusability:"Reusability", config_handling:"Config Handling",
    algo_usage:"Algorithm Usage", efficiency:"Efficiency", logic_complexity:"Logic Complexity",
    data_structures:"Data Structures", optimization:"Optimization", edge_cases:"Edge Cases",
    pull_requests:"Pull Requests", acceptance_rate:"Acceptance Rate", issues:"Issues",
    code_reviews:"Code Reviews", contributions:"Contributions", oss_activity:"OSS Activity",
    readme_quality:"README Quality", setup_guide:"Setup Guide", code_comments:"Code Comments",
    structure:"Structure", visuals:"Visuals", api_docs:"API Docs",
    growth_trajectory:"Growth Trajectory", complexity_increase:"Complexity Increase",
    tech_expansion:"Tech Expansion", learning_speed:"Learning Speed",
    experimentation:"Experimentation",
};
 
const LANG_COLORS = {
    Python:"#3572A5", JavaScript:"#f1e05a", TypeScript:"#2b7489",
    "C#":"#178600", Java:"#b07219", "C++":"#f34b7d", Go:"#00ADD8",
    Rust:"#dea584", HTML:"#e34c26", CSS:"#563d7c", Kotlin:"#A97BFF",
    "Jupyter Notebook":"#DA5B0B", Unknown:"#4a6080",
};
 
let radarInst = null;
let scoreTimer = null;
let analyzerData = {};
 
async function analyzeUser() {
    const u = document.getElementById("username").value.trim();
    if (!u) return;
    document.getElementById("result").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");
    closeBreakdown();
    try {
        const res  = await fetch("/analyze/" + u);
        const data = await res.json();
        document.getElementById("loading").classList.add("hidden");
        if (data.error) { alert(data.error); return; }
        analyzerData = data.analyzers;
        renderUserInfo(data.user_info);
        renderScoreRing(data.hireability.score, data.hireability.grade, data.hireability.label);
        renderCards(data.analyzers);
        renderRadar(data.analyzers);
        renderInsights(data.analyzers);
        renderRepos(data.repos);
        document.getElementById("result").classList.remove("hidden");
    } catch(e) {
        document.getElementById("loading").classList.add("hidden");
        console.error(e);
    }
}
 
function renderUserInfo(info) {
    if (!info) return;
    document.getElementById("userInfo").innerHTML =
        '<div class="user-profile">' +
        '<img src="' + (info.avatar_url||'') + '" class="avatar" alt="avatar"/>' +
        '<div class="user-profile-info">' +
        '<strong>' + (info.name || info.login) + '</strong>' +
        '<span class="handle">@' + info.login + '</span>' +
        '<span class="stats">' + (info.public_repos||0) + ' repos · ' + (info.followers||0) + ' followers</span>' +
        (info.bio ? '<span class="bio">' + info.bio + '</span>' : '') +
        '</div></div>';
}
 
function renderScoreRing(score, grade, label) {
    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");
    const cx = 70, cy = 70, r = 56;
    if (scoreTimer) clearInterval(scoreTimer);
    let cur = 0;
    scoreTimer = setInterval(function() {
        ctx.clearRect(0,0,140,140);
        ctx.beginPath();
        ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle = "#162035";
        ctx.lineWidth = 10;
        ctx.stroke();
        var end = (cur/100)*Math.PI*2 - Math.PI/2;
        ctx.beginPath();
        ctx.arc(cx,cy,r,-Math.PI/2,end);
        ctx.strokeStyle = cur>=70 ? "#00d4a0" : cur>=40 ? "#EF9F27" : "#D4537E";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.stroke();
        document.getElementById("scoreNumber").textContent = cur;
        if (cur >= score) {
            clearInterval(scoreTimer);
            document.getElementById("scoreGrade").textContent = grade + " · " + label;
        }
        cur++;
    }, 16);
}
 
function renderCards(a) {
    for (var key in ANALYZERS) {
        var cfg = ANALYZERS[key];
        var score = a[key][cfg.key];
        document.getElementById(cfg.elId).textContent = score + "%";
        (function(barId, s) {
            setTimeout(function() {
                document.getElementById(barId).style.width = s + "%";
            }, 200);
        })(cfg.barId, score);
    }
}
 
function renderRadar(a) {
    if (radarInst) radarInst.destroy();
    var scores = [];
    var colors = [];
    for (var key in ANALYZERS) {
        scores.push(a[key][ANALYZERS[key].key]);
        colors.push(ANALYZERS[key].color);
    }
    radarInst = new Chart(document.getElementById("radarChart"), {
        type: "radar",
        data: {
            labels: ["Commit","Architect","Algorithm","Collab","Docs","Developer"],
            datasets: [{
                data: scores,
                backgroundColor: "rgba(0,212,160,0.1)",
                borderColor: "#00d4a0",
                borderWidth: 1.5,
                pointBackgroundColor: colors,
                pointRadius: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { r: {
                min:0, max:100,
                ticks: { display:false },
                grid: { color:"rgba(255,255,255,0.05)" },
                pointLabels: { color:"#6a85a8", font:{ size:10 } }
            }}
        }
    });
}
 
function showBreakdown(key) {
    var cfg = ANALYZERS[key];
    var d   = analyzerData[key];
    if (!d) return;
    var score   = d[cfg.key];
    var metrics = d.sub_metrics || {};

    var tabsHtml = "";
    for (var k in ANALYZERS) {
        var isActive = k === key;
        var c = ANALYZERS[k].color;
        tabsHtml += '<button class="bd-tab' + (isActive?" active":"") + '" data-key="' + k + '"' +
            (isActive?' style="border-color:'+c+';color:'+c+'"':'') + '>' +
            '<span class="bd-tab-dot" style="background:' + c + '"></span>' +
            ANALYZERS[k].label.replace(" Analyzer","") +
            '</button>';
    }

    var metricsHtml = "";
    var formulaParts = [];
    var barLabels = [];
    var barValues = [];
    var donutValues = [];
    var weights = { frequency:20, consistency:25, active_days:15, msg_quality:20, time_dist:10, streak:10,
        folder_structure:20, modularity:25, dependencies:15, scalability:20, reusability:10, config_handling:10,
        algo_usage:25, efficiency:20, logic_complexity:20, data_structures:20, optimization:10, edge_cases:5,
        pull_requests:20, acceptance_rate:25, issues:15, code_reviews:20, contributions:10, oss_activity:10,
        readme_quality:30, setup_guide:20, code_comments:20, structure:15, visuals:10, api_docs:5,
        growth_trajectory:25, complexity_increase:20, tech_expansion:20, consistency:15, learning_speed:10, experimentation:10 };

    for (var mk in metrics) {
        var mv = metrics[mk];
        var w  = weights[mk] || 15;
        var lbl = METRIC_LABELS[mk] || mk;
        barLabels.push(lbl.split(" ")[0]);
        barValues.push(mv);
        donutValues.push(w);
        metricsHtml += '<div class="bd-row">' +
            '<span class="bd-lbl">' + lbl + '</span>' +
            '<span class="bd-w">' + w + '%</span>' +
            '<div class="bd-bar-wrap"><div class="bd-bar" style="width:' + mv + '%;background:' + cfg.color + '"></div></div>' +
            '<span class="bd-val">' + mv + '/' + w + '</span>' +
            '</div>';
        formulaParts.push('(' + mv + '/' + w + ')×' + w + '%');
    }

    document.getElementById("breakdownTitle").textContent = cfg.label;
    var badge = document.getElementById("breakdownScore");
    badge.textContent = score + " / 100";
    badge.style.color = cfg.color;

    document.getElementById("breakdownMetrics").innerHTML =
        '<div class="bd-tabs" id="bdTabs">' + tabsHtml + '</div>' +
        '<div class="bd-metrics">' + metricsHtml + '</div>' +
        '<div class="bd-charts">' +
            '<div class="bd-chart-box"><div class="bd-chart-title">Sub-metric scores</div><div style="position:relative;height:180px;"><canvas id="bdBarChart"></canvas></div></div>' +
            '<div class="bd-chart-box"><div class="bd-chart-title">Weight distribution</div><div style="display:flex;align-items:center;gap:16px;"><div style="position:relative;height:180px;width:180px;flex-shrink:0;"><canvas id="bdDonutChart"></canvas></div><div id="bdDonutLegend" class="bd-legend"></div></div></div>' +
        '</div>' +
        '<div class="bd-formula">' + formulaParts.join(" + ") + ' = <strong>' + score + '/100</strong></div>';

    document.getElementById("breakdownPanel").classList.remove("hidden");
    document.getElementById("breakdownPanel").scrollIntoView({behavior:"smooth"});

    // Bar chart
    if (window.bdBarInst) window.bdBarInst.destroy();
    window.bdBarInst = new Chart(document.getElementById("bdBarChart"), {
        type: "bar",
        data: {
            labels: barLabels,
            datasets: [{ data: barValues, backgroundColor: cfg.color + "99", borderColor: cfg.color, borderWidth: 1, borderRadius: 4, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: "#4a6080", font: { size: 10 } } },
                y: { min: 0, max: 100, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#4a6080", font: { size: 10 }, stepSize: 25 }, border: { display: false } }
            }
        }
    });

    // Donut chart
    if (window.bdDonutInst) window.bdDonutInst.destroy();
    var donutColors = [cfg.color, cfg.color+"cc", cfg.color+"99", cfg.color+"77", cfg.color+"55", cfg.color+"33"];
    window.bdDonutInst = new Chart(document.getElementById("bdDonutChart"), {
        type: "doughnut",
        data: { labels: barLabels, datasets: [{ data: donutValues, backgroundColor: donutColors, borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { display: false } } }
    });

    // Legend
    var legendHtml = "";
    for (var i = 0; i < barLabels.length; i++) {
        legendHtml += '<div class="bd-legend-item"><span style="width:9px;height:9px;border-radius:2px;background:' + donutColors[i] + ';display:inline-block;margin-right:5px;"></span>' + barLabels[i] + ' ' + donutValues[i] + '%</div>';
    }
    document.getElementById("bdDonutLegend").innerHTML = legendHtml;

    document.getElementById("bdTabs").addEventListener("click", function(e) {
        var btn = e.target.closest(".bd-tab");
        if (btn) showBreakdown(btn.getAttribute("data-key"));
    });
}
 
function closeBreakdown() {
    var panel = document.getElementById("breakdownPanel");
    if (panel) panel.classList.add("hidden");
}
 
function renderInsights(a) {
    var scores = [];
    for (var key in ANALYZERS) {
        scores.push({ label: ANALYZERS[key].label, score: a[key][ANALYZERS[key].key], color: ANALYZERS[key].color });
    }
    scores.sort(function(x,y) { return y.score - x.score; });
    var sHtml = "", wHtml = "";
    for (var i = 0; i < 3; i++) {
        sHtml += '<div class="insight-item"><span class="insight-dot" style="background:' + scores[i].color + '"></span><span><strong>' + scores[i].label + '</strong> — scored ' + scores[i].score + '%</span></div>';
    }
    for (var j = scores.length-1; j >= scores.length-3; j--) {
        wHtml += '<div class="insight-item"><span class="insight-dot" style="background:#D4537E"></span><span><strong>' + scores[j].label + '</strong> — scored ' + scores[j].score + '%, needs work</span></div>';
    }
    document.getElementById("strengths").innerHTML = sHtml;
    document.getElementById("weaknesses").innerHTML = wHtml;
}
 
function renderRepos(repos) {
    if (!repos || !repos.length) return;
    var html = "";
    for (var i = 0; i < repos.length; i++) {
        var r = repos[i];
        var langDot = r.language ? '<span class="repo-lang"><span class="lang-dot" style="background:' + (LANG_COLORS[r.language]||'#4a6080') + '"></span>' + r.language + '</span>' : '';
        var desc = r.description ? '<div class="repo-desc">' + r.description + '</div>' : '';
        html += '<a href="' + r.url + '" target="_blank" class="repo-card">' +
            '<div class="repo-name">' + r.name + '</div>' +
            desc +
            '<div class="repo-footer"><div class="repo-meta"><span class="repo-stat">⭐ ' + r.stars + '</span><span class="repo-stat">🍴 ' + r.forks + '</span></div>' +
            langDot + '</div></a>';
    }
    document.getElementById("repoList").innerHTML = html;
}
 
document.addEventListener("click", function(e) {
    var card = e.target.closest(".intel-card");
    if (card) {
        var key = card.getAttribute("data-analyzer");
        if (key && analyzerData[key]) showBreakdown(key);
    }
});
 
document.addEventListener("DOMContentLoaded", function() {
    var input = document.getElementById("username");
    if (input) {
        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") analyzeUser();
        });
    }
});