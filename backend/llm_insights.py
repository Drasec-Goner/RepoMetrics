import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_repo_insights(features, readme):

    prompt = f"""
You are a software engineering expert.

Analyze this GitHub repository.

Metrics:
Stars: {features['stars']}
Forks: {features['forks']}
Commits: {features['commits']}
Contributors: {features['contributors']}
Issues: {features['issues']}

README Content:
{readme}

Score the following from 0-100:

Documentation Quality
Project Clarity
Maintainability
Community Engagement

Return JSON like:

{{
"documentation": number,
"clarity": number,
"maintainability": number,
"community": number
}}
"""

    response = model.generate_content(prompt)

    return response.text