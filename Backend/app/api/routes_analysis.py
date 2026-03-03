from fastapi import APIRouter
from app.github_client import fetch_repositories
from app.services.analysis_service import run_full_analysis
from app.analyzers.commit_analyzer import analyze_commits
from app.analyzers.language_analyzer import analyze_languages
from app.services.scoring_service import calculate_hireability_score

router = APIRouter()

@router.get("/analyze/{username}")
def analyze(username: str):
    repos = fetch_repositories(username)
    analysis_result = run_full_analysis(username)
    analyze_commits_result = analyze_commits(repos)
    analyze_languages_result = analyze_languages(repos) 
    hireability_score = calculate_hireability_score(
        commit_score=analyze_commits_result.get("commit_score", 0),
        language_score=analyze_languages_result.get("language_score", 0),
    )

    return {
        "username": username,
        "repo_count": len(repos),
        "repos": repos,
        "commit_analysis": analyze_commits_result,
        "language_analysis": analyze_languages_result,
        "hireability_score": hireability_score

        
    }

# from fastapi import APIRouter


# router = APIRouter()

# @router.get("/analyze/{username}")
# async def analyze_user(username: str):
#     return await run_full_analysis(username)