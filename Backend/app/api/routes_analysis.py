from fastapi import APIRouter, HTTPException
from app.github_client import fetch_repositories
from app.services.analysis_service import run_full_analysis
from app.analyzers.commit_analyzer import analyze_commits
from app.analyzers.language_analyzer import analyze_languages
from app.services.scoring_service import calculate_hireability_score
from app.analyzers.engineering_analyzer import analyze as analyze_engineering

router = APIRouter()

@router.get("/analyze/{username}")
def analyze_user(username: str):

    try:
        repos = fetch_repositories(username)

        if not repos:
            raise HTTPException(status_code=404, detail="No repositories found")

        commit_result = analyze_commits(repos)
        language_result = analyze_languages(repos)
        engineering_result = analyze_engineering(repos)

        hireability_score = calculate_hireability_score(
            commit_score=commit_result.get("commit_score", 0),
            language_score=language_result.get("language_score", 0),
        )

        return {
            "username": username,
            "repo_count": len(repos),
            "commit_analysis": commit_result,
            "language_analysis": language_result,
            "engineering_analysis": engineering_result,
            "hireability_score": hireability_score
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))