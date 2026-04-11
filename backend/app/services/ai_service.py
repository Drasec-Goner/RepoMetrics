from google import genai
from app.core.config import settings
import json
import re


class AIService:

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def extract_json(self, text: str):
        """
        Extract JSON safely from Gemini output
        """

        if not text:
            raise ValueError("Empty AI response")

        # Remove markdown blocks
        text = re.sub(r"```json|```", "", text).strip()

        # Try direct parse
        try:
            return json.loads(text)
        except:
            pass

        # Try extracting JSON using regex
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())

        raise ValueError("Invalid JSON from AI")

    def analyze_repository(self, features: dict):

        prompt = f"""
You are a senior software architect.

Analyze this GitHub repository.

STRICTLY RETURN JSON ONLY.

FEATURES:
{features}

RETURN:
{{
  "scores": {{
    "activity": number,
    "collaboration": number,
    "documentation": number,
    "stability": number,
    "popularity": number
  }},
  "analysis": {{
    "summary": string,
    "strengths": [string],
    "weaknesses": [string],
    "recommendations": [string]
  }},
  "tech": {{
    "detected_stack": [string],
    "confidence": number
  }}
}}
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            text = response.text

            parsed = self.extract_json(text)

            return parsed

        except Exception as e:
            return {
                "error": str(e),
                "raw_response": getattr(response, "text", None) if "response" in locals() else None
            }
# feat: maintenance frequency scoring @ 2026-03-27T17:47:00
# feat: integrate Gemini AI @ 2026-03-31T11:35:00
# feat: AI scoring for all categories @ 2026-04-01T13:29:00
# feat: implement hybrid scoring (rule + AI) @ 2026-04-02T21:59:00
# feat: NLP keyword extraction @ 2026-04-03T19:00:00
# fix: handle AI JSON parsing errors @ 2026-04-04T10:15:00
# feat: add AI insights component @ 2026-04-11T11:39:00