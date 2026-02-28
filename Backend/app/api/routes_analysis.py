from fastapi import APIRouter
from app.github_client import fetch_repositories

router = APIRouter()

@router.get("/analyze/{username}")
def analyze(username: str):
    repos = fetch_repositories(username)

    return {
        "username": username,
        "repo_count": len(repos),
        "repos": repos
    }

from fastapi import APIRouter
from app.services.analysis_service import run_full_analysis

router = APIRouter()

@router.get("/analyze/{username}")
async def analyze_user(username: str):
    return await run_full_analysis(username)