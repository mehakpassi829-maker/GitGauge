from datetime import datetime
from collections import defaultdict
import re

def analyze_commits(repos):
    if not repos:
        return {"commit_score": 0, "sub_metrics": {}, "details": {}}

    now = datetime.utcnow()
    active_repos = 0
    weekly_activity = defaultdict(int)
    time_pattern = {"morning": 0, "afternoon": 0, "night": 0}
    message_quality_scores = []
    streaks = []
    total_estimated = 0

    for repo in repos:
        pushed_at = repo.get("pushed_at")
        created_at = repo.get("created_at")
        if not pushed_at or not created_at:
            continue

        pushed = datetime.strptime(pushed_at, "%Y-%m-%dT%H:%M:%SZ")
        created = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")

        age_days = max((now - created).days, 1)
        last_active = (now - pushed).days

        repo_commits = max(1, age_days // 10)
        total_estimated += repo_commits

        if last_active <= 30:
            active_repos += 1

        week_key = f"{pushed.year}-W{pushed.isocalendar()[1]}"
        weekly_activity[week_key] += repo_commits

        hour = pushed.hour
        if 6 <= hour < 12:
            time_pattern["morning"] += 1
        elif 12 <= hour < 18:
            time_pattern["afternoon"] += 1
        else:
            time_pattern["night"] += 1

        # Message quality: estimate from repo name & description
        desc = repo.get("description") or ""
        name = repo.get("name") or ""
        score = 0
        if len(desc) > 20: score += 40
        if len(desc) > 50: score += 20
        if not re.search(r'\b(fix|update|test|misc|wip)\b', desc.lower()): score += 20
        if any(c.isupper() for c in name): score += 20
        message_quality_scores.append(min(score, 100))

        streaks.append(min(age_days // 7, 30))

    total_repos = len(repos)
    active_weeks = len(weekly_activity)
    total_weeks = max((now - datetime.strptime(repos[-1]["created_at"], "%Y-%m-%dT%H:%M:%SZ")).days // 7, 1)

    # Sub-metric scores (each out of their weight)
    frequency   = min(100, (total_estimated / max(total_repos, 1)) * 3)
    consistency = min(100, (active_weeks / total_weeks) * 100)
    active_days = min(100, (active_repos / total_repos) * 100)
    msg_quality = sum(message_quality_scores) / len(message_quality_scores) if message_quality_scores else 0
    time_dist   = min(100, max(time_pattern.values()) / max(sum(time_pattern.values()), 1) * 100)
    streak      = min(100, (max(streaks) / 30) * 100) if streaks else 0

    commit_score = round(
        frequency   * 0.20 +
        consistency * 0.25 +
        active_days * 0.15 +
        msg_quality * 0.20 +
        time_dist   * 0.10 +
        streak      * 0.10
    )

    return {
        "commit_score": min(commit_score, 100),
        "sub_metrics": {
            "frequency":   round(frequency),
            "consistency": round(consistency),
            "active_days": round(active_days),
            "msg_quality": round(msg_quality),
            "time_dist":   round(time_dist),
            "streak":      round(streak),
        },
        "details": {
            "active_repos": active_repos,
            "estimated_commits": total_estimated,
            "time_pattern": time_pattern,
        }
    }
