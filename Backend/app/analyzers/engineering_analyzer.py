def analyze(repos):
    """
    Analyze repository architecture and engineering maturity
    """

    total_repos = len(repos)

    if total_repos == 0:
        return {
            "total_repos": 0,
            "avg_repo_size": 0,
            "total_forks": 0,
            "total_watchers": 0,
            "engineering_score": 0,
            "architecture_level": "Unknown"
        }

    total_size = 0
    forks = 0
    watchers = 0

    for repo in repos:
        if not isinstance(repo, dict):
            continue

        total_size += repo.get("size", 0)
        print(repos[0])
        print(f"Repo: {repo.get('name', 'N/A')}, Size: {repo.get('size', 0)}, Forks: {repo.get('forks_count', 0)}, Watchers: {repo.get('watchers_count', 0)}")
        forks += repo.get("forks_count", 0)
        watchers += repo.get("watchers_count", 0)

    avg_repo_size = round(total_size / total_repos, 2)

    # Complexity evaluation
    if avg_repo_size > 10000:
        architecture_level = "Advanced"
        complexity_score = 40
    elif avg_repo_size > 3000:
        architecture_level = "Intermediate"
        complexity_score = 25
    else:
        architecture_level = "Basic"
        complexity_score = 10

    collaboration_score = min((forks + watchers), 30)

    engineering_score = complexity_score + collaboration_score

    return {
        "total_repos": total_repos,
        "avg_repo_size": avg_repo_size,
        "total_forks": forks,
        "total_watchers": watchers,
        "architecture_level": architecture_level,
        "engineering_score": engineering_score,
        "collaboration_score": collaboration_score

    }