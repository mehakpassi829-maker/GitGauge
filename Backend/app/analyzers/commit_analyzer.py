def analyze_commits(commit_data):
    return {
        "total_commits": 120,
        "consistency_score": 75
    }

# app/analyzers/commit_analyzer.py


def analyze_commits(repos):
    """
    Basic commit intelligence.
    For now, we simulate commit scoring using repo activity.
    """

    total_repos = len(repos)

    if total_repos == 0:
        return {
            "total_repos": 0,
            "commit_score": 0
        }

    total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)

    # Simple logic for starter scoring
    commit_score = min(100, total_stars + total_repos * 5)

    return {
        "total_repos": total_repos,
        "total_stars": total_stars,
        "commit_score": commit_score
    }