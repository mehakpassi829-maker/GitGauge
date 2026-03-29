import httpx
import os

GITHUB_API = "https://api.github.com"
TOKEN = os.getenv("GITHUB_TOKEN", "")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

async def fetch_user_repos(username: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{GITHUB_API}/users/{username}/repos?per_page=100&sort=updated",
            headers=HEADERS
        )
        return r.json() if r.status_code == 200 else []

async def fetch_user_info(username: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{GITHUB_API}/users/{username}", headers=HEADERS)
        return r.json() if r.status_code == 200 else {}