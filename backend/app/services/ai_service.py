from google import genai
from app.core.config import settings
import json
import re
import hashlib
import copy
import random
import time


class AIService:

    _MODEL_CANDIDATES = ("gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash")
    _MAX_RETRIES = 3
    _BASE_BACKOFF_SECONDS = 1.2
    _RATE_LIMIT_COOLDOWN_SECONDS = 60

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self._response_cache: dict[str, dict] = {}
        self._cooldown_until = 0.0

    @staticmethod
    def _looks_like_rate_limit_error(error: Exception) -> bool:
        text = str(error).lower()
        return (
            "429" in text
            or "rate limit" in text
            or "too many requests" in text
            or "quota" in text
            or "resource_exhausted" in text
        )

    def _request_ai_with_retries(self, prompt: str):
        now = time.time()
        if now < self._cooldown_until:
            wait_for = int(self._cooldown_until - now)
            raise RuntimeError(f"Gemini temporarily rate-limited. Retry after {wait_for}s.")

        last_error: Exception | None = None

        for model_name in self._MODEL_CANDIDATES:
            for attempt in range(self._MAX_RETRIES):
                try:
                    return self.client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config={
                            "temperature": 0,
                        },
                    )
                except Exception as error:
                    last_error = error
                    if self._looks_like_rate_limit_error(error):
                        is_last_attempt = attempt == self._MAX_RETRIES - 1
                        if is_last_attempt:
                            break

                        backoff = (self._BASE_BACKOFF_SECONDS * (2 ** attempt)) + random.uniform(0.0, 0.4)
                        time.sleep(backoff)
                        continue

                    # Non rate-limit errors should move to next model immediately.
                    break

        if last_error and self._looks_like_rate_limit_error(last_error):
            self._cooldown_until = time.time() + self._RATE_LIMIT_COOLDOWN_SECONDS

        raise RuntimeError(str(last_error) if last_error else "Gemini request failed")

    def _make_cache_key(self, features: dict, languages: dict) -> str:
        payload = {
            "features": features,
            "languages": languages,
        }
        content = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

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
        except Exception:
            pass

        # Try extracting JSON using regex
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())

        raise ValueError("Invalid JSON from AI")

    def analyze_repository(self, features: dict, languages: dict | None = None):
        languages = languages or {}
        cache_key = self._make_cache_key(features, languages)

        cached = self._response_cache.get(cache_key)
        if cached:
            return copy.deepcopy(cached)

        prompt = f"""
You are a senior software architect.

Analyze this GitHub repository.

STRICTLY RETURN JSON ONLY.

FEATURES:
{features}

LANGUAGE_METER:
{languages}

RULES:
- Base every statement strictly on the provided FEATURES.
- Use LANGUAGE_METER to infer the real tech stack when possible.
- Use deterministic NLP signals from FEATURES (readme_word_count, readme_section_count, readme_keyword_score, readme_flesch_reading_ease) when judging documentation quality.
- If has_readme is false, you may mention missing README.
- If has_readme is true, do NOT claim README is missing.
- If recent_commits is 70 or above, do NOT claim low or minimal recent activity.
- Do not use markdown formatting markers like ** in output strings.
- Keep strengths and weaknesses specific, measurable, and non-repetitive.
- Ensure recommendations are concrete and prioritized.
- Confidence should be conservative when evidence is sparse.

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
        "verdict": string,
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
            response = self._request_ai_with_retries(prompt)

            text = response.text or ""

            parsed = self.extract_json(text)
            stabilized = self._enforce_consistency(parsed, features)
            self._response_cache[cache_key] = copy.deepcopy(stabilized)
            return stabilized

        except Exception as e:
            return {
                "error": str(e),
                "raw_response": getattr(response, "text", None) if "response" in locals() else None
            }

    def _enforce_consistency(self, parsed: dict, features: dict):
        analysis = parsed.get("analysis", {}) if isinstance(parsed, dict) else {}
        strengths = analysis.get("strengths", []) if isinstance(analysis, dict) else []
        weaknesses = analysis.get("weaknesses", []) if isinstance(analysis, dict) else []

        if not isinstance(strengths, list):
            strengths = []
        if not isinstance(weaknesses, list):
            weaknesses = []

        has_readme = bool(features.get("has_readme"))
        recent_commits = float(features.get("recent_commits", 0) or 0)

        cleaned_strengths = []
        for item in strengths:
            text = str(item)
            lower = text.lower()

            if not has_readme and ("readme" in lower and ("good" in lower or "strong" in lower or "comprehensive" in lower)):
                continue

            if recent_commits < 30 and (
                "active" in lower
                or "high activity" in lower
                or "consistent development" in lower
            ):
                continue

            normalized = text.replace("**", "").strip()
            if not normalized:
                continue
            cleaned_strengths.append(normalized)

        cleaned_weaknesses = []
        for item in weaknesses:
            text = str(item)
            lower = text.lower()

            if has_readme and ("readme" in lower and ("missing" in lower or "no readme" in lower)):
                continue

            if recent_commits >= 70 and (
                "low activity" in lower
                or "minimal activity" in lower
                or "inactive" in lower
                or "stale" in lower
            ):
                continue

            normalized = text.replace("**", "").strip()
            if not normalized:
                continue
            cleaned_weaknesses.append(normalized)

        if isinstance(analysis, dict):
            if not cleaned_strengths:
                if has_readme:
                    cleaned_strengths.append("README is present, improving baseline discoverability.")
                if recent_commits >= 70:
                    cleaned_strengths.append("Recent activity indicates ongoing maintenance.")
                if float(features.get("issue_closure_rate", 0) or 0) >= 0.5:
                    cleaned_strengths.append("Issue handling trend is healthy.")

            if not cleaned_weaknesses:
                if not has_readme:
                    cleaned_weaknesses.append("README is missing.")
                if recent_commits < 30:
                    cleaned_weaknesses.append("Recent activity is limited.")

            analysis["strengths"] = cleaned_strengths[:6]
            analysis["weaknesses"] = cleaned_weaknesses

            recs = analysis.get("recommendations", [])
            if isinstance(recs, list):
                analysis["recommendations"] = [
                    cleaned
                    for r in recs
                    for cleaned in [str(r).replace("**", "").strip()]
                    if cleaned
                ]

            verdict = analysis.get("verdict", "")
            if isinstance(verdict, str):
                analysis["verdict"] = verdict.replace("**", "").strip()

        parsed["analysis"] = analysis
        return parsed
