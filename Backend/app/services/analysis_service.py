from app.services.github_service import fetch_user_repos, fetch_user_info
from app.analyzers.commit_analyzer import analyze_commits
from Backend.app.analyzers.architect_analyzer import analyze_architect
from app.analyzers.algorithm_analyzer import analyze_algorithm
from app.analyzers.collaboration_analyzer import analyze_collaboration
from app.analyzers.documentation_analyzer import analyze_documentation
from app.analyzers.developer_analyzer import analyze_developer
from app.services.scoring_service import calculate_hireability_score

async def run_full_analysis(username: str):
    repos     = await fetch_user_repos(username)
    user_info = await fetch_user_info(username)

    if not repos:
        return {"username": username, "error": "No repositories found"}

    commit        = analyze_commits(repos)
    architect     = analyze_architect(repos)
    algorithm     = analyze_algorithm(repos)
    collaboration = analyze_collaboration(repos, user_info)
    documentation = analyze_documentation(repos)
    developer     = analyze_developer(repos, user_info)

    hireability = calculate_hireability_score(
        commit["commit_score"],
        architect["architect_score"],
        algorithm["algorithm_score"],
        collaboration["collaboration_score"],
        documentation["documentation_score"],
        developer["developer_score"],
    )

    return {
        "username":      username,
        "user_info":     user_info,
        "hireability":   hireability,
        "analyzers": {
            "commit":        commit,
            "architect":     architect,
            "algorithm":     algorithm,
            "collaboration": collaboration,
            "documentation": documentation,
            "developer":     developer,
        }
    }