import requests
from backend.app.core.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"


def get_github_login_url():

    url = (
        f"{GITHUB_AUTH_URL}"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=repo"
    )

    return url


def exchange_code_for_token(code):

    payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code
    }

    headers = {"Accept": "application/json"}

    response = requests.post(GITHUB_TOKEN_URL, data=payload, headers=headers)

    return response.json().get("access_token")