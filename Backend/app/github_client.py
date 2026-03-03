import requests
from app.config import GITHUB_API_URL, GITHUB_TOKEN


def fetch_repositories(username: str):
    url = f"{GITHUB_API_URL}/users/{username}/repos"

    headers = {}

    # Add token only if it exists
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    response = requests.get(url, headers=headers)

    # Debug info (very helpful if something breaks)
    if response.status_code != 200:
        print("GitHub API ERROR")
        print("Status Code:", response.status_code)
        print("Response:", response.text)
        raise Exception("GitHub API error")

    repos_data = response.json()

    # Return simplified repo information
    return [
        {
            "name": repo["name"],
            "stars": repo["stargazers_count"],
            "language": repo["language"],
        }
        for repo in repos_data
    ]
