def analyze_collaboration(repos, user_info):
    if not repos:
        return {"collaboration_score": 0, "sub_metrics": {}}

    total = len(repos)
    total_forks    = sum(r.get("forks_count", 0) for r in repos)
    total_watchers = sum(r.get("watchers_count", 0) for r in repos)
    total_stars    = sum(r.get("stargazers_count", 0) for r in repos)
    followers      = user_info.get("followers", 0)
    following      = user_info.get("following", 0)
    public_gists   = user_info.get("public_gists", 0)

    pr_score          = min(100, total_forks * 10)
    acceptance_rate   = min(100, (total_forks / max(total, 1)) * 50)
    issues_score      = min(100, total_watchers * 8)
    review_score      = min(100, followers * 2)
    contrib_score     = min(100, following * 1.5)
    oss_score         = min(100, total_stars * 5 + public_gists * 10)

    collaboration_score = round(
        pr_score        * 0.20 +
        acceptance_rate * 0.25 +
        issues_score    * 0.15 +
        review_score    * 0.20 +
        contrib_score   * 0.10 +
        oss_score       * 0.10
    )

    return {
        "collaboration_score": min(collaboration_score, 100),
        "sub_metrics": {
            "pull_requests":    round(pr_score),
            "acceptance_rate":  round(acceptance_rate),
            "issues":           round(issues_score),
            "code_reviews":     round(review_score),
            "contributions":    round(contrib_score),
            "oss_activity":     round(oss_score),
        }
    }