from fastapi import APIRouter, HTTPException

from Backend.app.github_client import fetch_repositories
from Backend.app.analyzers.commit_analyzer import analyze_commits
from Backend.app.analyzers.language_analyzer import analyze_languages
from Backend.app.analyzers.engineering_analyzer import analyze as analyze_engineering
from Backend.app.services.scoring_service import calculate_hireability_score

router = APIRouter()


@router.get("/analyze/{username}")
def analyze_user(username: str):

    try:
        repos = fetch_repositories(username)

        if not repos:
            raise HTTPException(
                status_code=404,
                detail="No repositories found"
            )

        # Analyses
        commit_result = analyze_commits(repos)
        language_result = analyze_languages(repos)
        engineering_result = analyze_engineering(repos)

        # Hireability Score
        hireability_score = calculate_hireability_score(
            commit_score=commit_result.get("commit_score", 0),
            language_score=language_result.get("language_score", 0),
        )

        # Clean repo list for frontend
        repo_list = []

        for repo in repos:
            repo_list.append({
                "name": repo.get("name"),
                "url": repo.get("html_url"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0)
            })

        return {
            "username": username,                                                               
            "repo_count": len(repos),
            "repos": repo_list,
            "commit_analysis": commit_result,
            "language_analysis": language_result,
            "engineering_analysis": engineering_result,
            "hireability_score": hireability_score
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )