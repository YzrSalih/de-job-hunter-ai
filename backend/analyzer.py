import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# System prompt is cached — not re-billed on every API call
SYSTEM_PROMPT = """You are a job listing analysis assistant. Analyze the given job posting and respond in JSON format.

Evaluation criteria:
- Is the job English-friendly? (explicitly says "no German required", "English OK", or the posting itself is in English)
- Is German language required? (B2/C1 German requirement is a rejection reason)
- Tech stack match: React, TypeScript, JavaScript, Next.js, Node.js, Python, REST API

Respond ONLY with the following JSON — no extra text:
{
  "is_english_friendly": true/false,
  "german_required": true/false,
  "german_level_mentioned": "B2" | "C1" | "A1" | null,
  "tech_match_score": 0-100,
  "matched_techs": ["React", "TypeScript"],
  "missing_techs": ["Java"],
  "summary": "2-3 sentence summary in English",
  "recommendation": "apply" | "skip" | "maybe"
}"""


def analyze_job(job: dict) -> dict | None:
    text = f"Başlık: {job.get('title', '')}\nŞirket: {job.get('company', '')}\nKonum: {job.get('location', '')}\n\nİlan:\n{job.get('description', '')[:3000]}"

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},  # Prompt caching
                }
            ],
            messages=[{"role": "user", "content": text}],
        )
        raw = response.content[0].text.strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        print(f"[Analyzer] JSON parse error for: {job.get('title')}")
        return None
    except Exception as e:
        print(f"[Analyzer] Claude API error: {e}")
        return None
