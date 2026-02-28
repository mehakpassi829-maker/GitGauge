# app/services/analysis_service.py

from app.services.github_service import fetch_user_repos
from app.analyzers.commit_analyzer import analyze_commits
from app.analyzers.language_analyzer import analyze_languages
from app.services.scoring_service import calculate_hireability_score


async def run_full_analysis(username: str):
    """
    Main orchestration function.
    This coordinates all intelligence engines.
    """

    # 1️⃣ Fetch repositories
    repos = await fetch_user_repos(username)

    if not repos:
        return {
            "username": username,
            "error": "No repositories found"
        }

    # 2️⃣ Run Commit Intelligence
    commit_result = analyze_commits(repos)

    # 3️⃣ Run Language Intelligence
    language_result = analyze_languages(repos)

    # 4️⃣ Calculate Final Hireability Score
    hireability_score = calculate_hireability_score(
        commit_score=commit_result.get("commit_score", 0),
        language_score=language_result.get("language_score", 0),
    )

    # 5️⃣ Final Structured Response
    return {
        "username": username,
        "commit_intelligence": commit_result,
        "language_intelligence": language_result,
        "hireability_score": hireability_score
    }