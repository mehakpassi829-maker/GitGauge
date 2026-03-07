# app/services/github_service.py

import httpx

GITHUB_API_URL = "https://api.github.com"


async def fetch_user_repos(username: str):
    """
    Fetch public repositories of a GitHub user.
    """

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/users/{username}/repos"
        )

        if response.status_code != 200:
            return []

        return response.json()