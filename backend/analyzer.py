import os
import json
import re
import html
from typing import Optional
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

_profile_path = os.path.join(os.path.dirname(__file__), "cv_profile.json")
with open(_profile_path) as f:
    CV = json.load(f)

PRIMARY = ", ".join(CV["primary_skills"])
SECONDARY = ", ".join(CV["secondary_skills"])
DOMAINS = ", ".join(CV["domains"])
TARGET_ROLES = ", ".join(CV.get("target_roles", []))

SYSTEM_PROMPT = f"""You are an AI job matching assistant for a software developer.

Candidate profile:
- Name: {CV["name"]}
- Title: {CV["title"]}
- Experience: {CV["years_of_experience"]}+ years
- Target roles: {TARGET_ROLES}
- Primary skills: {PRIMARY}
- Secondary skills: {SECONDARY}
- Domains: {DOMAINS}
- Language: English (fluent), German (none)
- Target: English-friendly positions in Germany or remote

Evaluation rules:
1. german_required = true if the job requires German (B1/B2/C1/C2 or "Deutschkenntnisse erforderlich")
2. is_english_friendly = true if the posting is in English OR explicitly says no German needed
3. tech_match_score = 0-100 based on overlap with candidate's primary and secondary skills
4. recommendation must be exactly one of: "apply", "maybe", "skip"
   - "apply": English-friendly, tech_match_score >= 50, relevant role
   - "maybe": English-friendly but lower match or unclear requirements
   - "skip": German required, irrelevant role, or very low match

Respond ONLY with a raw JSON object — no markdown, no code blocks, no explanation:
{{"is_english_friendly": true, "german_required": false, "german_level_mentioned": null, "tech_match_score": 75, "matched_techs": ["Node.js", "TypeScript"], "missing_techs": ["React"], "summary": "2-3 sentence summary.", "recommendation": "apply"}}"""


def _clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _extract_json(raw: str) -> Optional[dict]:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def analyze_job(job: dict) -> Optional[dict]:
    description = _clean_html(job.get("description", ""))[:3000]
    text = (
        f"Title: {job.get('title', '')}\n"
        f"Company: {job.get('company', '')}\n"
        f"Location: {job.get('location', '')}\n\n"
        f"Job description:\n{description}"
    )

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": text}],
        )
        raw = response.content[0].text
        result = _extract_json(raw)
        if result is None:
            print(f"[Analyzer] Could not extract JSON for: {job.get('title')}")
            return None

        # Enforce strict recommendation values
        rec = str(result.get("recommendation", "")).lower()
        if rec not in ("apply", "maybe", "skip"):
            score = result.get("tech_match_score", 0)
            result["recommendation"] = "apply" if score >= 50 else "maybe" if score >= 25 else "skip"

        return result
    except Exception as e:
        print(f"[Analyzer] Claude API error: {e}")
        return None
