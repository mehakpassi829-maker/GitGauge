def AlgorithmAnalyzer(repos):
    """
    Detect algorithm-heavy repositories.
    """

    algorithm_keywords = [
        "algorithm",
        "algorithms",
        "dsa",
        "data-structure",
        "leetcode",
        "competitive",
        "codeforces",
        "hackerrank",
        "dynamic-programming",
        "graph",
        "tree",
        "sorting",
        "search"
    ]

    algorithm_repo_count = 0

    for repo in repos:
        name = (repo.get("name") or "").lower()
        description = (repo.get("description") or "").lower()

        if any(keyword in name for keyword in algorithm_keywords) or \
           any(keyword in description for keyword in algorithm_keywords):
            algorithm_repo_count += 1

    # Calculate algorithm score AFTER counting
    if algorithm_repo_count == 0:
        algorithm_score = 5
    elif algorithm_repo_count <= 2:
        algorithm_score = 15
    else:
        algorithm_score = 25

    return {
        "algorithm_repos": algorithm_repo_count,
        "algorithm_score": algorithm_score
    }