from datetime import datetime
from collections import defaultdict

def analyze_commits(repos):
    """
    Advanced estimation of commit behavior using repository metadata
    """

    total_repos = len(repos)

    if total_repos == 0:
        return {
            "total_repos": 0,
            "estimated_commits": 0,
            "consistency_score": 0,
            "commits_per_week": 0,
            "active_repos": 0,
            "inactive_repos": 0,
            
        }

    now = datetime.utcnow()

    active_repos = 0
    inactive_repos = 0
    estimated_commits = 0

    weekly_activity = defaultdict(int)
    time_pattern = {
        "morning": 0,
        "afternoon": 0,
        "night": 0
    }

    for repo in repos:
        pushed_at = repo.get("pushed_at")
        created_at = repo.get("created_at")

        if not pushed_at or not created_at:
            continue

        pushed_date = datetime.strptime(pushed_at, "%Y-%m-%dT%H:%M:%SZ")
        created_date = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")

        repo_age_days = (now - created_date).days
        last_active_days = (now - pushed_date).days

        # 🔹 Estimate commits based on repo age
        repo_commits = max(1, repo_age_days // 10)
        estimated_commits += repo_commits

        # 🔹 Active vs inactive
        if last_active_days <= 30:
            active_repos += 1
        else:
            inactive_repos += 1

        # 🔹 Weekly estimation (based on last push)
        week_key = f"{pushed_date.year}-W{pushed_date.isocalendar()[1]}"
        weekly_activity[week_key] += repo_commits

        # 🔹 Time pattern (based on push time)
        hour = pushed_date.hour
        if 6 <= hour < 12:
            time_pattern["morning"] += 1
        elif 12 <= hour < 18:
            time_pattern["afternoon"] += 1
        else:
            time_pattern["night"] += 1

    # 🔹 Consistency score (based on active repos)
    consistency_score = min(100, active_repos * 10)

    # 🔹 Avg commits per week
    commits_per_week = (
        sum(weekly_activity.values()) // len(weekly_activity)
        if weekly_activity else 0
    )

    return {
        "total_repos": total_repos,
        "active_repos": active_repos,
        "inactive_repos": inactive_repos,
        "estimated_commits": estimated_commits,
        "commits_per_week": commits_per_week,
        "consistency_score": consistency_score,
        "weekly_distribution": dict(weekly_activity),
        "time_pattern": time_pattern
    }