def analyze_documentation(repos):
    if not repos:
        return {"documentation_score": 0, "sub_metrics": {}}

    total = len(repos)
    readme_scores, setup_scores, visual_scores = [], [], []
    has_desc = 0

    for repo in repos:
        desc = repo.get("description") or ""
        homepage = repo.get("homepage") or ""
        has_wiki = repo.get("has_wiki", False)
        has_pages = repo.get("has_pages", False)
        topics = repo.get("topics", [])

        # README quality proxy: description length
        readme = min(100, len(desc) * 2)
        readme_scores.append(readme)

        # Setup guide proxy: homepage/wiki/pages
        setup = 0
        if homepage: setup += 40
        if has_wiki: setup += 30
        if has_pages: setup += 30
        setup_scores.append(setup)

        # Visuals proxy: topics count, homepage
        visual = min(100, len(topics) * 15 + (20 if homepage else 0))
        visual_scores.append(visual)

        if desc: has_desc += 1

    readme_score  = sum(readme_scores) / total
    setup_score   = sum(setup_scores) / total
    comments      = min(100, (has_desc / total) * 100)
    structure     = min(100, readme_score * 0.8)
    visuals       = sum(visual_scores) / total
    api_docs      = min(100, setup_score * 0.5)

    documentation_score = round(
        readme_score * 0.30 +
        setup_score  * 0.20 +
        comments     * 0.20 +
        structure    * 0.15 +
        visuals      * 0.10 +
        api_docs     * 0.05
    )

    return {
        "documentation_score": min(documentation_score, 100),
        "sub_metrics": {
            "readme_quality": round(readme_score),
            "setup_guide":    round(setup_score),
            "code_comments":  round(comments),
            "structure":      round(structure),
            "visuals":        round(visuals),
            "api_docs":       round(api_docs),
        }
    }
