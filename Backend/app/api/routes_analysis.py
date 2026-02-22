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