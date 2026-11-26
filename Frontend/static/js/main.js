/**
 * GitGauge – Developer Intelligence Platform
 * Complete SPA Controller v2.0
 * Handles: routing, analysis, charts, engine detail pages, history
 */

'use strict';

/* ═══════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════ */
const ANALYZERS = {
  commit: {
    label: 'Commit Intelligence',
    key: 'commit_score',
    color: '#5BB89A',
    barId: 'commitBar',
    elId: 'commitScore',
    pageId: 'page-commit',
    contentId: 'commitEngineContent',
    desc: 'Commit cadence, active streaks, and message quality'
  },
  architect: {
    label: 'Architecture Intelligence',
    key: 'architect_score',
    color: '#6B94C9',
    barId: 'archBar',
    elId: 'archScore',
    pageId: 'page-architect',
    contentId: 'architectEngineContent',
    desc: 'Repository organisation, modularity, and dependency management'
  },
  algorithm: {
    label: 'Algorithm Intelligence',
    key: 'algorithm_score',
    color: '#5DB8C4',
    barId: 'techBar',
    elId: 'techScore',
    pageId: 'page-algorithm',
    contentId: 'algorithmEngineContent',
    desc: 'Algorithmic patterns, complexity indicators, and logic depth'
  },
  collaboration: {
    label: 'Collaboration Intelligence',
    key: 'collaboration_score',
    color: '#C47F98',
    barId: 'collabBar',
    elId: 'collaboration_score',
    pageId: 'page-collaboration',
    contentId: 'collaborationEngineContent',
    desc: 'Pull requests, issue participation, and multi-contributor patterns'
  },
  documentation: {
    label: 'Documentation Intelligence',
    key: 'documentation_score',
    color: '#8A82C8',
    barId: 'docBar',
    elId: 'docScore',
    pageId: 'page-documentation',
    contentId: 'documentationEngineContent',
    desc: 'README completeness, setup guides, and project clarity'
  },
  developer: {
    label: 'Developer Growth',
    key: 'developer_score',
    color: '#C9A35A',
    barId: 'devBar',
    elId: 'growthScore',
    pageId: 'page-developer',
    contentId: 'developerEngineContent',
    desc: 'Language breadth, technology diversity, and continuous growth'
  }
};

const PAGES = [
  'overview','reports','growth','history',
  'commit','architect','algorithm','documentation','collaboration','developer',
  'ide','profile','settings','help','guest'
];

/* ═══════════════════════════════════════
   STATE
   ═══════════════════════════════════════ */
let analyzerData = {};
let currentUsername = '';
let currentData = null;
let analysisHistory = [];
let scoreChart = null;
let radarChart = null;
let showRepos = true;

/* ═══════════════════════════════════════
   SPA ROUTING
   ═══════════════════════════════════════ */
function navigatePage(pageKey, pushState) {
  if (!PAGES.includes(pageKey)) {
    pageKey = 'overview';
  }

  // Remove active from all pages
  PAGES.forEach(function(p) {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });

  // Activate target page
  const target = document.getElementById('page-' + pageKey);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.classList.toggle('active', item.getAttribute('data-page') === pageKey);
  });

  // Handle guest analysis footer button
  const guestBtn = document.getElementById('guestAnalysisBtn');
  if (guestBtn) guestBtn.style.outline = pageKey === 'guest' ? '2px solid var(--accent)' : '';

  // Push browser history
  if (pushState !== false) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageKey);
    if (currentUsername) url.searchParams.set('username', currentUsername);
    history.pushState({ page: pageKey, username: currentUsername }, '', url.toString());
  }

  // Page-specific actions
  if (pageKey === 'growth') renderGrowthCenter();
  if (pageKey === 'reports') renderReportsPage();
  if (ANALYZERS[pageKey]) renderEnginePage(pageKey);

  // Close mobile menu
  closeMobileMenu();

  // Scroll page body to top
  const pb = document.getElementById('pageBody') || document.querySelector('.page-body');
  if (pb) pb.scrollTop = 0;
}

window.addEventListener('popstate', function(e) {
  const state = e.state;
  if (state && state.page) {
    if (state.username && state.username !== currentUsername) {
      analyzeUser(state.username);
    } else {
      navigatePage(state.page, false);
    }
  }
});

/* ═══════════════════════════════════════
   ANALYSIS
   ═══════════════════════════════════════ */
function analyzeUser(forceUsername) {
  const input = document.getElementById('topbarUsername');
  const username = (forceUsername || (input && input.value.trim()) || '').replace(/^@/, '').trim();

  if (!username) {
    if (input) { input.focus(); input.style.outline = '2px solid var(--err)'; setTimeout(function(){ input.style.outline = ''; }, 2000); }
    return;
  }
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,37}[a-zA-Z0-9])?$/.test(username) && username.length > 1) {
    showToast('Invalid GitHub username format.');
    return;
  }

  currentUsername = username;
  if (input) input.value = username;

  // Show loading on overview
  navigatePage('overview', false);
  document.getElementById('overviewEmpty').classList.add('hidden');
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');

  fetch('/analyze/' + encodeURIComponent(username))
    .then(function(r) {
      if (!r.ok) return r.json().then(function(d){ throw new Error(d.detail || 'Analysis failed'); });
      return r.json();
    })
    .then(function(data) {
      currentData = data;
      analyzerData = {};
      const az = data.analyzers || {};
      Object.keys(ANALYZERS).forEach(function(k) {
        if (az[k]) analyzerData[k] = az[k];
      });
      updateHistory(username, data);
      renderDashboard(data);
      renderEnginePagesData();

      // Push state with username
      const url = new URL(window.location.href);
      url.searchParams.set('username', username);
      url.searchParams.set('page', 'overview');
      history.pushState({ page: 'overview', username: username }, '', url.toString());
    })
    .catch(function(err) {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('overviewEmpty').classList.remove('hidden');
      showToast('Error: ' + (err.message || 'Could not analyze profile. Check the username and try again.'));
    });
}

function guestAnalyze() {
  const input = document.getElementById('guestUsername');
  const u = (input && input.value.trim()) || '';
  if (!u) { if (input) input.focus(); return; }
  const topInput = document.getElementById('topbarUsername');
  if (topInput) topInput.value = u;
  analyzeUser(u);
  navigatePage('overview', false);
}

/* ═══════════════════════════════════════
   DASHBOARD RENDER
   ═══════════════════════════════════════ */
function renderDashboard(data) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('overviewEmpty').classList.add('hidden');

  const h = data.hireability || {};
  const az = data.analyzers || {};
  const info = data.user_info || {};

  // Welcome heading
  const name = info.name || currentUsername;
  document.getElementById('welcomeHeading').textContent = name + '\'s Developer Report';
  document.getElementById('fetchTimestamp').textContent = 'Live snapshot · ' + new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});

  // Score
  const score = h.score || 0;
  animateScoreRing(score, h.grade || '—');
  document.getElementById('scoreGrade').textContent = h.label || '—';

  // User info
  renderUserInfo(info, data);

  // Radar
  renderRadarChart(az);

  // Intel cards
  const cards = {
    commit: ['commitScore','commitBar'],
    architect: ['archScore','archBar'],
    algorithm: ['techScore','techBar'],
    collaboration: ['collaboration_score','collabBar'],
    documentation: ['docScore','docBar'],
    developer: ['growthScore','devBar']
  };
  Object.keys(cards).forEach(function(k) {
    const d = az[k];
    const scoreKey = ANALYZERS[k].key;
    const val = d ? (d[scoreKey] || 0) : 0;
    const scoreEl = document.getElementById(cards[k][0]);
    const barEl = document.getElementById(cards[k][1]);
    if (scoreEl) scoreEl.textContent = val + '/100';
    if (barEl) setTimeout(function(){ barEl.style.width = val + '%'; }, 100);
  });

  // Insights
  renderInsights(az);

  // Repos
  renderRepos(data.repos || []);
}

function renderUserInfo(info, data) {
  const container = document.getElementById('userInfo');
  if (!container) return;
  const name = info.name || currentUsername;
  const login = info.login || currentUsername;
  const avatar = info.avatar_url || '';
  const bio = info.bio || '';
  const followers = info.followers || 0;
  const following = info.following || 0;
  const publicRepos = info.public_repos || (data.repos ? data.repos.length : 0);
  container.innerHTML =
    '<div class="user-info-row">' +
      (avatar ? '<img src="' + escapeHtml(avatar) + '" class="user-avatar" alt="avatar">' : '') +
      '<div>' +
        '<div class="user-name">' + escapeHtml(name) + '</div>' +
        '<div class="user-login">@' + escapeHtml(login) + '</div>' +
      '</div>' +
    '</div>' +
    (bio ? '<p style="font-size:13px;color:var(--muted);line-height:1.5">' + escapeHtml(bio) + '</p>' : '') +
    '<div class="user-meta">' +
      '<div class="user-meta-pill"><svg viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>' + publicRepos + ' repos</div>' +
      '<div class="user-meta-pill"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' + followers + ' followers</div>' +
      '<div class="user-meta-pill"><svg viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>' + following + ' following</div>' +
    '</div>';

  // Update profile page
  const plu = document.getElementById('profileLastUsername');
  const pls = document.getElementById('profileLastScore');
  if (plu) plu.textContent = '@' + login;
  if (pls && currentData) pls.textContent = 'Score: ' + (currentData.hireability || {}).score + '/100 · Grade: ' + ((currentData.hireability || {}).grade || '—');
}

/* ═══════════════════════════════════════
   SCORE RING  (Canvas arc)
   ═══════════════════════════════════════ */
function animateScoreRing(score, grade) {
  const canvas = document.getElementById('scoreCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 70, cy = 70, r = 58;
  let current = 0;
  const target = score;
  const color = scoreColor(score);

  document.getElementById('scoreGrade').textContent = grade;

  function draw(val) {
    ctx.clearRect(0, 0, 140, 140);
    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI/2, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Fill
    const end = -Math.PI/2 + (Math.PI * 2 * val / 100);
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI/2, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    document.getElementById('scoreNumber').textContent = Math.round(val);
  }

  const step = function() {
    current += (target - current) * 0.1 + 0.5;
    if (current >= target) { draw(target); return; }
    draw(current);
    requestAnimationFrame(step);
  };
  step();
}

function scoreColor(s) {
  if (s >= 85) return '#34D399';
  if (s >= 70) return '#5BB89A';
  if (s >= 55) return '#6B94C9';
  if (s >= 40) return '#C9A35A';
  return '#C47F98';
}

/* ═══════════════════════════════════════
   RADAR CHART
   ═══════════════════════════════════════ */
function renderRadarChart(az) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const scores = [
    getScore(az, 'commit', 'commit_score'),
    getScore(az, 'architect', 'architect_score'),
    getScore(az, 'algorithm', 'algorithm_score'),
    getScore(az, 'documentation', 'documentation_score'),
    getScore(az, 'collaboration', 'collaboration_score'),
    getScore(az, 'developer', 'developer_score')
  ];
  if (radarChart) { radarChart.destroy(); radarChart = null; }
  radarChart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Commit','Architect','Algorithm','Docs','Collab','Growth'],
      datasets: [{
        data: scores,
        fill: true,
        backgroundColor: 'rgba(52,211,153,.10)',
        borderColor: 'rgba(52,211,153,.7)',
        pointBackgroundColor: 'rgba(52,211,153,.9)',
        pointBorderColor: 'transparent',
        borderWidth: 1.8,
        pointRadius: 3
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false, stepSize: 25 },
          grid: { color: 'rgba(255,255,255,.06)' },
          angleLines: { color: 'rgba(255,255,255,.06)' },
          pointLabels: { color: '#8B8FA5', font: { size: 10, family: 'Inter' } }
        }
      }
    }
  });
}

function getScore(az, engine, key) {
  return (az[engine] && az[engine][key]) ? az[engine][key] : 0;
}

/* ═══════════════════════════════════════
   INSIGHTS
   ═══════════════════════════════════════ */
function renderInsights(az) {
  const strengths = [];
  const weaknesses = [];

  Object.keys(ANALYZERS).forEach(function(k) {
    const d = az[k];
    if (!d) return;
    const score = d[ANALYZERS[k].key] || 0;
    const label = ANALYZERS[k].label;
    if (score >= 65) strengths.push(label + ' (' + score + '/100)');
    else if (score < 45) weaknesses.push(label + ': ' + score + '/100 — focus area for improvement');
  });

  const sEl = document.getElementById('strengths');
  const wEl = document.getElementById('weaknesses');
  if (sEl) {
    sEl.innerHTML = strengths.length
      ? '<ul>' + strengths.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>'
      : '<p style="font-size:13px;color:var(--dim)">Run an analysis to see strengths.</p>';
  }
  if (wEl) {
    wEl.innerHTML = weaknesses.length
      ? '<ul>' + weaknesses.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>'
      : '<p style="font-size:13px;color:var(--dim)">No major improvement areas found.</p>';
  }
}

/* ═══════════════════════════════════════
   REPO LIST
   ═══════════════════════════════════════ */
function renderRepos(repos) {
  const container = document.getElementById('repoList');
  const section = document.getElementById('repoSection');
  if (!container) return;
  if (!repos || !repos.length || !showRepos) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  let html = '';
  repos.slice(0, 24).forEach(function(r) {
    const desc = r.description ? '<div class="repo-desc">' + escapeHtml(r.description.slice(0, 90)) + '</div>' : '<div class="repo-desc" style="color:var(--dim)">No description</div>';
    const lang = r.language ? '<span class="repo-lang">' + escapeHtml(r.language) + '</span>' : '';
    html += '<a href="' + escapeHtml(r.url || '#') + '" target="_blank" rel="noopener noreferrer" class="repo-card">' +
      '<div class="repo-name">' + escapeHtml(r.name || 'repository') + '</div>' +
      desc +
      '<div class="repo-footer">' +
        '<div class="repo-meta">' +
          '<span class="repo-stat">★ ' + (r.stars || 0) + '</span>' +
          '<span class="repo-stat">⑂ ' + (r.forks || 0) + '</span>' +
        '</div>' +
        lang +
      '</div>' +
    '</a>';
  });
  container.innerHTML = html;
}

function toggleRepoSection() {
  showRepos = !showRepos;
  const section = document.getElementById('repoSection');
  if (section) section.style.display = showRepos ? '' : 'none';
}

/* ═══════════════════════════════════════
   BREAKDOWN PANEL
   ═══════════════════════════════════════ */
function showBreakdown(key) {
  const cfg = ANALYZERS[key];
  const data = analyzerData[key];
  if (!cfg || !data) return;

  const score = data[cfg.key] || 0;
  document.getElementById('breakdownTitle').textContent = cfg.label;
  document.getElementById('breakdownScore').textContent = score + '/100';
  document.getElementById('breakdownScore').style.color = cfg.color;

  const sub = data.sub_metrics || {};
  if (!Object.keys(sub).length) {
    document.getElementById('breakdownMetrics').innerHTML = '<p style="color:var(--muted);font-size:13px">Detailed sub-metrics not available for this engine.</p>';
  } else {
    let html = '<div class="breakdown-metric-grid">';
    Object.keys(sub).forEach(function(k) {
      const val = sub[k] || 0;
      html += '<div class="breakdown-metric">' +
        '<div class="breakdown-metric-name">' + k.replace(/_/g,' ') + '</div>' +
        '<div class="breakdown-metric-val" style="color:' + cfg.color + '">' + val + '</div>' +
        '<div class="breakdown-metric-bar"><div class="breakdown-metric-fill" style="width:' + val + '%;background:' + cfg.color + '"></div></div>' +
      '</div>';
    });
    html += '</div>';
    document.getElementById('breakdownMetrics').innerHTML = html;
  }

  document.getElementById('breakdownPanel').classList.remove('hidden');
  document.getElementById('breakdownPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeBreakdown() {
  document.getElementById('breakdownPanel').classList.add('hidden');
}

/* ═══════════════════════════════════════
   ENGINE DETAIL PAGES
   ═══════════════════════════════════════ */
function renderEnginePagesData() {
  Object.keys(ANALYZERS).forEach(function(k) {
    if (analyzerData[k]) renderEnginePage(k);
  });
}

function renderEnginePage(key) {
  const cfg = ANALYZERS[key];
  const container = document.getElementById(cfg.contentId);
  if (!container) return;

  const data = analyzerData[key];
  if (!data) {
    container.innerHTML = engineEmptyState(cfg.label);
    return;
  }

  const score = data[cfg.key] || 0;
  const sub = data.sub_metrics || {};
  const details = data.details || {};

  let html = '';

  // Score banner
  html += '<div class="score-banner">' +
    '<div class="score-banner-num" style="color:' + cfg.color + '">' + score + '</div>' +
    '<div class="score-banner-info">' +
      '<h4>' + cfg.label + '</h4>' +
      '<p>' + cfg.desc + '</p>' +
    '</div>' +
    '<div class="score-bar"><div class="score-bar-fill" style="background:' + cfg.color + ';width:' + score + '%"></div></div>' +
  '</div>';

  // Sub-metric cards
  if (Object.keys(sub).length) {
    html += '<div class="section-title" style="margin-top:4px">Sub-Metrics</div>';
    html += '<div class="metric-grid">';
    Object.keys(sub).forEach(function(k) {
      const val = sub[k] || 0;
      html += '<div class="metric-card">' +
        '<div class="metric-card-label">' + k.replace(/_/g,' ') + '</div>' +
        '<div class="metric-card-value" style="color:' + cfg.color + '">' + val + '</div>' +
        '<div class="metric-card-unit">/ 100</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // Additional details if available
  if (key === 'commit' && details.time_pattern) {
    const tp = details.time_pattern;
    const total = (tp.morning||0) + (tp.afternoon||0) + (tp.night||0) || 1;
    html += '<div class="detail-panel" style="margin-top:4px"><h4>Commit Time Distribution</h4><div class="bar-chart">';
    [['Morning','morning','#5BB89A'],['Afternoon','afternoon','#6B94C9'],['Night','night','#8A82C8']].forEach(function(r){
      const pct = Math.round((tp[r[1]]||0)/total*100);
      html += '<div class="bar-row"><div class="bar-label">' + r[0] + '</div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + r[2] + '"></div></div><div class="bar-pct">' + pct + '%</div></div>';
    });
    html += '</div></div>';
    if (details.active_repos !== undefined) {
      html += '<div style="margin-top:8px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--muted)">' +
        'Active repos (last 30d): <strong style="color:var(--text)">' + details.active_repos + '</strong> · ' +
        'Estimated commits: <strong style="color:var(--text)">' + (details.estimated_commits||0) + '</strong>' +
      '</div>';
    }
  }

  if (key === 'developer' && details.languages && details.languages.length) {
    html += '<div class="detail-panel" style="margin-top:4px"><h4>Detected Languages (' + details.languages.length + ')</h4>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">' +
      details.languages.map(function(l){ return '<span class="pill">' + escapeHtml(l) + '</span>'; }).join('') +
      '</div>' +
      (details.account_age_days ? '<p style="font-size:12px;color:var(--muted);margin-top:12px">Oldest repository age: <strong style="color:var(--text)">' + details.account_age_days + ' days</strong></p>' : '') +
    '</div>';
  }

  // Strengths & improvements
  const strengths = buildEngineStrengths(key, data, sub, score);
  const improvements = buildEngineImprovements(key, data, sub, score);

  html += '<div class="detail-two-col">';
  html += '<div class="detail-panel strengths"><h4>✦ Strengths</h4><ul>' +
    (strengths.length ? strengths.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') : '<li>Analyze a profile to view strengths.</li>') +
  '</ul></div>';
  html += '<div class="detail-panel improvements"><h4>→ Areas to Improve</h4><ul>' +
    (improvements.length ? improvements.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') : '<li>No major improvement areas identified.</li>') +
  '</ul></div>';
  html += '</div>';

  // Recommendations
  const recs = buildEngineRecs(key, sub, score);
  if (recs.length) {
    html += '<div class="detail-panel recs"><h4>◎ Recommendations</h4><ul>' +
      recs.map(function(r){ return '<li>' + escapeHtml(r) + '</li>'; }).join('') +
    '</ul></div>';
  }

  container.innerHTML = html;
}

function engineEmptyState(label) {
  return '<div class="engine-empty">' +
    '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
    '<h4>No data for ' + escapeHtml(label) + '</h4>' +
    '<p>Analyze a GitHub profile to view this engine\'s detailed report.</p>' +
  '</div>';
}

function buildEngineStrengths(key, data, sub, score) {
  var s = [];
  if (score >= 75) s.push('Strong overall performance — top-tier ' + ANALYZERS[key].label.toLowerCase());
  if (key === 'commit') {
    if ((sub.consistency||0) >= 65) s.push('Consistent commit cadence across repositories');
    if ((sub.msg_quality||0) >= 60) s.push('Good repository & commit description quality');
    if ((sub.streak||0) >= 60) s.push('Healthy streak patterns');
  }
  if (key === 'architect') {
    if ((sub.modularity||0) >= 60) s.push('Good modular code organisation');
    if ((sub.dependencies||0) >= 50) s.push('Consistent licensing and dependency hygiene');
    if ((sub.scalability||0) >= 50) s.push('Strong community forks and watcher signals');
  }
  if (key === 'algorithm') {
    if ((sub.data_structures||0) >= 60) s.push('Strong language complexity and data structure indicators');
    if ((sub.algo_usage||0) >= 50) s.push('Explicit algorithmic / DSA repository focus');
    if (score >= 60) s.push('Algorithmic sophistication above median');
  }
  if (key === 'documentation') {
    if ((sub.readme_quality||0) >= 60) s.push('Strong repository description & README coverage');
    if ((sub.setup_guide||0) >= 50) s.push('Setup guides, wikis, or project pages present');
    if (score >= 65) s.push('Projects are well-documented for their scope');
  }
  if (key === 'collaboration') {
    if ((sub.pull_requests||0) >= 60) s.push('Active fork & pull request engagement');
    if ((sub.issues||0) >= 60) s.push('Strong watcher and issue participation');
    if ((sub.oss_activity||0) >= 50) s.push('Notable open-source stars and gist activity');
  }
  if (key === 'developer') {
    if ((sub.tech_expansion||0) >= 60) s.push('Broad multi-language portfolio');
    if ((sub.consistency||0) >= 55) s.push('Long-term development consistency');
    if ((sub.growth_trajectory||0) >= 60) s.push('Healthy repository growth trajectory');
  }
  return s;
}

function buildEngineImprovements(key, data, sub, score) {
  var w = [];
  if (score < 40) w.push('Overall ' + ANALYZERS[key].label + ' score is below 40 — significant improvement possible');
  if (key === 'commit') {
    if ((sub.consistency||0) < 50) w.push('Irregular commit cadence detected — aim for weekly commits');
    if ((sub.msg_quality||0) < 45) w.push('Repository descriptions and naming can be more descriptive');
    if ((sub.frequency||0) < 40) w.push('Low estimated commit frequency');
  }
  if (key === 'architect') {
    if ((sub.dependencies||0) < 40) w.push('Add open-source licenses to your public repositories');
    if ((sub.modularity||0) < 40) w.push('Repository scale and modular depth can be expanded');
    if ((sub.reusability||0) < 40) w.push('Add GitHub topics to improve discoverability and reusability');
  }
  if (key === 'algorithm') {
    if ((sub.optimization||0) < 40) w.push('Few algorithm or DSA-focused repositories detected');
    if ((sub.logic_complexity||0) < 40) w.push('Build larger, multi-module projects to demonstrate logic depth');
  }
  if (key === 'documentation') {
    if ((sub.readme_quality||0) < 50) w.push('Repository descriptions are missing or brief in several projects');
    if ((sub.setup_guide||0) < 40) w.push('Enable GitHub Pages, wikis, or homepage links for documentation');
  }
  if (key === 'collaboration') {
    if ((sub.pull_requests||0) < 40) w.push('Low fork and pull request activity detected');
    if (score < 40) w.push('Engage more with open-source projects via issues, forks, and PRs');
  }
  if (key === 'developer') {
    if ((sub.tech_expansion||0) < 40) w.push('Primarily mono-language profile — consider exploring new languages');
    if ((sub.learning_speed||0) < 40) w.push('Project sizes are uniform — try tackling larger, deeper builds');
  }
  return w;
}

function buildEngineRecs(key, sub, score) {
  var r = [];
  if (key === 'commit') {
    r.push('Commit at least once a week to maintain a healthy cadence score.');
    r.push('Use descriptive commit messages (feat, fix, docs prefixes improve quality score).');
  }
  if (key === 'architect') {
    r.push('Add a tests/ or __tests__/ directory to your projects to improve test presence score.');
    r.push('Use a consistent directory structure across projects.');
  }
  if (key === 'algorithm') {
    r.push('Create repositories with algorithm implementations to signal depth.');
    r.push('Use meaningful repository names that reflect the problem domain.');
  }
  if (key === 'documentation') {
    r.push('Every repository should have a README with at least: description, installation, and usage.');
    r.push('Add a CONTRIBUTING.md for open-source projects.');
  }
  if (key === 'collaboration') {
    r.push('Open or comment on issues in projects you use.');
    r.push('Submit pull requests to open-source repositories — even documentation fixes count.');
  }
  if (key === 'developer') {
    r.push('Explore a new language or framework in a side project.');
    r.push('Maintain at least a few active repositories across multiple years to show longevity.');
  }
  return r;
}

/* ═══════════════════════════════════════
   REPORTS PAGE
   ═══════════════════════════════════════ */
function renderReportsPage() {
  const empty = document.getElementById('reportsEmpty');
  const content = document.getElementById('reportsContent');
  const grid = document.getElementById('reportsGrid');
  if (!grid) return;
  if (!currentData) {
    if (empty) empty.style.display = '';
    if (content) content.classList.add('hidden');
    return;
  }
  if (empty) empty.style.display = 'none';
  if (content) content.classList.remove('hidden');

  let html = '';
  const az = currentData.analyzers || {};
  Object.keys(ANALYZERS).forEach(function(k) {
    const cfg = ANALYZERS[k];
    const d = az[k];
    const score = d ? (d[cfg.key] || 0) : 0;
    html += '<div class="intel-card" data-analyzer="' + k + '" onclick="navigatePage(\'' + cfg.pageId.replace('page-','') + '\')">' +
      '<div class="intel-card-header"><h3>' + cfg.label + '</h3><span class="intel-card-badge" style="color:' + cfg.color + '">' + score + '/100</span></div>' +
      '<div class="intel-card-desc">' + cfg.desc + '</div>' +
      '<p style="color:' + cfg.color + '">' + score + '/100</p>' +
      '<div class="mini-bar-wrap"><div class="mini-bar" style="background:' + cfg.color + ';width:' + score + '%"></div></div>' +
      '<span class="card-click-hint">View detailed report →</span>' +
    '</div>';
  });
  grid.innerHTML = html;
}

/* ═══════════════════════════════════════
   GROWTH CENTER PAGE
   ═══════════════════════════════════════ */
function renderGrowthCenter() {
  const empty = document.getElementById('growthEmpty');
  const content = document.getElementById('growthContent');
  const metrics = document.getElementById('growthMetrics');
  if (!content || !metrics) return;
  if (!currentData) {
    if (empty) empty.style.display = '';
    content.classList.add('hidden');
    return;
  }
  if (empty) empty.style.display = 'none';
  content.classList.remove('hidden');

  const az = currentData.analyzers || {};
  const dev = az.developer || {};
  const sub = dev.sub_metrics || {};
  const score = dev.developer_score || 0;

  let html = '<div class="score-banner">' +
    '<div class="score-banner-num" style="color:var(--c6)">' + score + '</div>' +
    '<div class="score-banner-info"><h4>Developer Growth Score</h4><p>Technology expansion, language diversity, and consistent repository growth</p></div>' +
    '<div class="score-bar"><div class="score-bar-fill" style="background:var(--c6);width:' + score + '%"></div></div>' +
  '</div>';

  if (Object.keys(sub).length) {
    html += '<div class="section-title">Growth Metrics</div><div class="metric-grid">';
    Object.keys(sub).forEach(function(k) {
      html += '<div class="metric-card"><div class="metric-card-label">' + k.replace(/_/g,' ') + '</div>' +
        '<div class="metric-card-value" style="color:var(--c6)">' + (sub[k]||0) + '</div>' +
        '<div class="metric-card-unit">/ 100</div></div>';
    });
    html += '</div>';
  }

  // All six scores as trend bars
  html += '<div class="section-title">Intelligence Score Comparison</div>';
  html += '<div class="detail-panel"><div class="bar-chart">';
  Object.keys(ANALYZERS).forEach(function(k) {
    const cfg = ANALYZERS[k];
    const s = getScore(az, k, cfg.key);
    html += '<div class="bar-row"><div class="bar-label" style="width:120px;font-size:11px">' + cfg.label.replace(' Intelligence','').replace(' Growth','') + '</div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + s + '%;background:' + cfg.color + '"></div></div>' +
      '<div class="bar-pct">' + s + '</div></div>';
  });
  html += '</div></div>';

  const strengths = buildEngineStrengths('developer', dev, sub, score);
  const improvements = buildEngineImprovements('developer', dev, sub, score);
  const recs = buildEngineRecs('developer', sub, score);
  html += '<div class="detail-two-col" style="margin-top:12px">' +
    '<div class="detail-panel strengths"><h4>✦ Growth Strengths</h4><ul>' +
    (strengths.length ? strengths.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') : '<li>Keep building across diverse projects to surface strengths.</li>') +
    '</ul></div>' +
    '<div class="detail-panel improvements"><h4>→ Areas to Improve</h4><ul>' +
    (improvements.length ? improvements.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') : '<li>No major growth gaps identified.</li>') +
    '</ul></div>' +
  '</div>';
  if (recs.length) {
    html += '<div class="detail-panel recs" style="margin-top:12px"><h4>◎ Growth Recommendations</h4><ul>' +
      recs.map(function(r){ return '<li>' + escapeHtml(r) + '</li>'; }).join('') +
    '</ul></div>';
  }

  metrics.innerHTML = html;
}

/* ═══════════════════════════════════════
   ANALYSIS HISTORY
   ═══════════════════════════════════════ */
function updateHistory(username, data) {
  const existing = analysisHistory.find(function(h){ return h.username === username; });
  const entry = {
    username: username,
    score: (data.hireability || {}).score || 0,
    grade: (data.hireability || {}).grade || '—',
    date: new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})
  };
  if (existing) {
    Object.assign(existing, entry);
  } else {
    analysisHistory.unshift(entry);
  }
  renderHistoryPage();
}

function renderHistoryPage() {
  const empty = document.getElementById('historyEmpty');
  const content = document.getElementById('historyContent');
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  if (!analysisHistory.length) {
    if (empty) empty.style.display = '';
    if (content) content.classList.add('hidden');
    return;
  }
  if (empty) empty.style.display = 'none';
  if (content) content.classList.remove('hidden');

  let html = '';
  analysisHistory.forEach(function(h) {
    html += '<tr>' +
      '<td>' + escapeHtml(h.username) + '</td>' +
      '<td style="color:var(--accent)">' + h.score + '/100</td>' +
      '<td>' + escapeHtml(h.grade) + '</td>' +
      '<td>' + escapeHtml(h.date) + '</td>' +
      '<td><button class="btn-ghost" style="font-size:12px;padding:4px 10px" onclick="analyzeUser(\'' + escapeHtml(h.username) + '\')">View report</button></td>' +
    '</tr>';
  });
  tbody.innerHTML = html;
}

/* ═══════════════════════════════════════
   IDE PAGE
   ═══════════════════════════════════════ */
function showIdeJson() {
  const view = document.getElementById('ideJsonView');
  const pre = document.getElementById('ideJsonPre');
  if (!view || !pre) return;
  if (!currentData) {
    showToast('No analysis data available. Run an analysis first.');
    return;
  }
  pre.textContent = JSON.stringify(currentData, null, 2);
  view.style.display = view.style.display === 'none' ? '' : 'none';
}

/* ═══════════════════════════════════════
   SIDEBAR COLLAPSE
   ═══════════════════════════════════════ */
function toggleSidebar() {
  const shell = document.getElementById('appShell');
  if (!shell) return;
  shell.classList.toggle('collapsed');
  const st = document.getElementById('settingSidebarToggle');
  if (st) st.classList.toggle('on', shell.classList.contains('collapsed'));
}

/* ═══════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════ */
function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
}

/* ═══════════════════════════════════════
   TOAST
   ═══════════════════════════════════════ */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='0'; toast.style.transform='translateY(8px)'; toast.style.transition='.3s'; setTimeout(function(){ toast.remove(); }, 350); }, 3200);
}

/* ═══════════════════════════════════════
   UTILS
   ═══════════════════════════════════════ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

/* ═══════════════════════════════════════
   INIT – DOM READY
   ═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {

  /* Sidebar nav click delegation */
  document.addEventListener('click', function(e) {
    const navItem = e.target.closest('[data-page]');
    if (!navItem) return;
    e.preventDefault();
    const page = navItem.getAttribute('data-page');
    if (page) navigatePage(page);
  });

  /* Sidebar toggle */
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

  /* Mobile hamburger */
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', closeMobileMenu);
    window.addEventListener('resize', function() {
      if (window.innerWidth > 680) closeMobileMenu();
    });
  }

  /* Topbar Enter key */
  const topbarInput = document.getElementById('topbarUsername');
  if (topbarInput) {
    topbarInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); analyzeUser(); }
    });
  }

  /* Guest username Enter key */
  const guestInput = document.getElementById('guestUsername');
  if (guestInput) {
    guestInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); guestAnalyze(); }
    });
  }

  /* Intel card click -> breakdown */
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.intel-card[data-analyzer]');
    if (!card) return;
    const key = card.getAttribute('data-analyzer');
    if (key && analyzerData[key]) {
      showBreakdown(key);
    }
  });

  /* Handle URL params on load */
  try {
    const params = new URLSearchParams(window.location.search);
    const qUser = params.get('username');
    const qPage = params.get('page') || 'overview';
    if (qUser) {
      analyzeUser(qUser);
    } else {
      navigatePage(qPage, false);
    }
  } catch(err) {
    console.error('URL param error:', err);
    navigatePage('overview', false);
  }
});
