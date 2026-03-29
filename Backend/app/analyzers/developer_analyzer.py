from datetime import datetime

def analyze_developer(repos, user_info):
    if not repos:
        return {"developer_score": 0, "sub_metrics": {}}

    now = datetime.utcnow()
    languages = set()
    sizes = []
    ages = []

    for repo in repos:
        lang = repo.get("language")
        if lang: languages.add(lang)
        sizes.append(repo.get("size", 0))
        created = repo.get("created_at", "")
        if created:
            dt = datetime.strptime(created, "%Y-%m-%dT%H:%M:%SZ")
            ages.append((now - dt).days)

    total = len(repos)
    account_age_days = max(ages) if ages else 1
    account_age_months = max(account_age_days // 30, 1)

    # Growth: repo creation rate over time
    growth = min(100, (total / account_age_months) * 20)

    # Complexity increase: average repo size trend
    complexity = min(100, (sum(sizes) / max(total, 1)) / 50)

    # Tech expansion: unique languages
    tech_expansion = min(100, len(languages) * 18)

    # Consistency: active months ratio
    active_months = user_info.get("public_repos", total)
    consistency = min(100, (active_months / account_age_months) * 10)

    # Learning speed: newer repos tend to be bigger = learning
    sorted_sizes = sorted(sizes)
    learning = min(100, (sorted_sizes[-1] / max(sorted_sizes[0], 1)) * 10) if sizes else 0

    # Experimentation: topic/language diversity
    experimentation = min(100, len(languages) * 15)

    developer_score = round(
        growth          * 0.25 +
        complexity      * 0.20 +
        tech_expansion  * 0.20 +
        consistency     * 0.15 +
        learning        * 0.10 +
        experimentation * 0.10
    )

    return {
        "developer_score": min(developer_score, 100),
        "sub_metrics": {
            "growth_trajectory":  round(growth),
            "complexity_increase":round(complexity),
            "tech_expansion":     round(tech_expansion),
            "consistency":        round(consistency),
            "learning_speed":     round(learning),
            "experimentation":    round(experimentation),
        },
        "details": {
            "languages": list(languages),
            "account_age_days": account_age_days,
        }
    }