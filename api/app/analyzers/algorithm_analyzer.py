def analyze_algorithm(repos):
    if not repos:
        return {"algorithm_score": 0, "sub_metrics": {}}

    total = len(repos)
    lang_complexity = {
        "C": 95, "C++": 90, "Rust": 88, "Go": 75, "Java": 70,
        "Python": 65, "JavaScript": 55, "TypeScript": 60,
        "Ruby": 50, "PHP": 45, "HTML": 10, "CSS": 10, "Shell": 30
    }

    lang_scores, size_scores = [], []
    has_tests = 0

    for repo in repos:
        lang = repo.get("language") or "Unknown"
        size = repo.get("size", 0)
        name = (repo.get("name") or "").lower()
        desc = (repo.get("description") or "").lower()

        lang_scores.append(lang_complexity.get(lang, 40))
        size_scores.append(min(100, size / 80))

        # Heuristic: test repos or algo-named repos
        if any(k in name + desc for k in ["algo", "dsa", "leetcode", "sort", "tree", "graph", "dp"]):
            has_tests += 1

    avg_lang   = sum(lang_scores) / total
    avg_size   = sum(size_scores) / total
    algo_usage = min(100, (has_tests / total) * 100 + avg_lang * 0.3)

    efficiency      = min(100, avg_lang)
    logic_complex   = min(100, avg_size * 1.1)
    data_structures = min(100, avg_lang * 0.9)
    optimization    = min(100, (has_tests / total) * 100)
    edge_cases      = min(100, avg_size * 0.5)

    algorithm_score = round(
        algo_usage      * 0.25 +
        efficiency      * 0.20 +
        logic_complex   * 0.20 +
        data_structures * 0.20 +
        optimization    * 0.10 +
        edge_cases      * 0.05
    )

    return {
        "algorithm_score": min(algorithm_score, 100),
        "sub_metrics": {
            "algo_usage":       round(algo_usage),
            "efficiency":       round(efficiency),
            "logic_complexity": round(logic_complex),
            "data_structures":  round(data_structures),
            "optimization":     round(optimization),
            "edge_cases":       round(edge_cases),
        }
    }
