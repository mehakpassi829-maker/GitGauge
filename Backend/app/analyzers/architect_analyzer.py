def analyze_architect(repos):
    if not repos:
        return {"architect_score": 0, "sub_metrics": {}}

    total = len(repos)
    size_scores, fork_scores, watcher_scores = [], [], []
    has_topics, has_license, has_homepage = 0, 0, 0

    for repo in repos:
        size = repo.get("size", 0)
        forks = repo.get("forks_count", 0)
        watchers = repo.get("watchers_count", 0)
        topics = repo.get("topics", [])

        size_scores.append(min(100, size / 100))
        fork_scores.append(min(100, forks * 20))
        watcher_scores.append(min(100, watchers * 10))

        if topics: has_topics += 1
        if repo.get("license"): has_license += 1
        if repo.get("homepage"): has_homepage += 1

    avg_size     = sum(size_scores) / total
    avg_forks    = sum(fork_scores) / total
    avg_watchers = sum(watcher_scores) / total

    folder_score    = min(100, avg_size)
    modularity      = min(100, avg_size * 1.2)
    dependency      = min(100, (has_license / total) * 100)
    scalability     = min(100, avg_forks + avg_watchers)
    reusability     = min(100, (has_topics / total) * 100)
    config_handling = min(100, (has_homepage / total) * 100)

    architect_score = round(
        folder_score    * 0.20 +
        modularity      * 0.25 +
        dependency      * 0.15 +
        scalability     * 0.20 +
        reusability     * 0.10 +
        config_handling * 0.10
    )

    return {
        "architect_score": min(architect_score, 100),
        "sub_metrics": {
            "folder_structure": round(folder_score),
            "modularity":       round(modularity),
            "dependencies":     round(dependency),
            "scalability":      round(scalability),
            "reusability":      round(reusability),
            "config_handling":  round(config_handling),
        }
    }
    