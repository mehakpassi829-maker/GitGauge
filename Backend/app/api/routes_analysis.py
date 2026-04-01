from fastapi import APIRouter, HTTPException
from backend.app.services.github_service import fetch_user_repos, fetch_user_info
from backend.app.analyzers.commit_analyzer import analyze_commits
from backend.app.analyzers.architect_analyzer import analyze_architect
from backend.app.analyzers.algorithm_analyzer import analyze_algorithm
from backend.app.analyzers.collaboration_analyzer import analyze_collaboration
from backend.app.analyzers.documentation_analyzer import analyze_documentation
from backend.app.analyzers.developer_analyzer import analyze_developer
from backend.app.services.scoring_service import calculate_hireability_score
import asyncio

router = APIRouter()

@router.get("/analyze/{username}")
def analyze_user(username: str):
    try:
        # Fetch data
        repos     = asyncio.run(fetch_user_repos(username))
        user_info = asyncio.run(fetch_user_info(username))

        if not repos:
            raise HTTPException(status_code=404, detail="No repositories found")

        # Run all 6 analyzers
        commit        = analyze_commits(repos)
        architect     = analyze_architect(repos)
        algorithm     = analyze_algorithm(repos)
        collaboration = analyze_collaboration(repos, user_info)
        documentation = analyze_documentation(repos)
        developer     = analyze_developer(repos, user_info)

        # Final hireability score
        hireability = calculate_hireability_score(
            commit["commit_score"],
            architect["architect_score"],
            algorithm["algorithm_score"],
            collaboration["collaboration_score"],
            documentation["documentation_score"],
            developer["developer_score"],
        )

        # Clean repo list
        repo_list = [{
         "name":        r.get("name"),
         "url":         r.get("html_url"),
         "stars":       r.get("stargazers_count", 0),
         "forks":       r.get("forks_count", 0),
         "language":    r.get("language") or "Unknown",
         "description": r.get("description") or "",
} for r in repos]

        return {
            "username":   username,
            "user_info":  user_info,
            "repo_count": len(repos),
            "repos":      repo_list,
            "hireability": hireability,
            "analyzers": {
                "commit":        commit,
                "architect":     architect,
                "algorithm":     algorithm,
                "collaboration": collaboration,
                "documentation": documentation,
                "developer":     developer,
            }
        }

    except HTTPException:
        
        raise HTTPException(status_code=404, detail="No repositories found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
