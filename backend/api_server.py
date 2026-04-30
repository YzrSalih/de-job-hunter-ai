import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

_cv_path = os.path.join(os.path.dirname(__file__), "cv_profile.json")
with open(_cv_path) as f:
    CV = json.load(f)

CV_TEXT = f"""
Name: {CV['name']} — {CV['title']}
Experience: {CV['years_of_experience']}+ years

Primary skills: {', '.join(CV['primary_skills'])}
Secondary skills: {', '.join(CV['secondary_skills'])}
Domains: {', '.join(CV['domains'])}

Work Experience:

- Fullstack Developer @ MxTrux Inc (11/2025 - 03/2026)
  • Architected and deployed autonomous AI agents using the Linqra Framework and Node.js/TypeScript, automating end-to-end dispatching workflows and reducing manual freight operations via agentic orchestration.
  • Developed AI-driven ranking engines by integrating Python-based microservices with Firebase, enabling real-time load matching through advanced data parsing and multi-criteria decision-making algorithms.
  • Built a "Talk to Your Data" (RAG) system using LLMs and Vector Search to allow dispatchers to query complex PDF contracts and rate confirmations, significantly reducing document processing time.
  • Designed and implemented responsive cross-platform interfaces with React and NativeWind, translating Figma prototypes into high-performance user flows for driver-facing mobile and web applications.
  • Built a full-stack iOS application using React Native, delivering end-to-end mobile features from UI to backend API integration.
  • Utilized Alteryx for ETL pipelines and Python microservices for automated data validation and regulatory submissions.

- Software Developer @ EnreSoft LLC (02/2024 - 09/2025)
  • Engineered high-throughput data pipelines using Java Spring Boot and Python across distributed systems.
  • Boosted system performance ~40% with Redis distributed caching and complex PostgreSQL/Oracle query optimization.
  • Built robust CI/CD pipelines with JUnit and Jest; achieved high test coverage to minimize reporting errors.
  • Integrated external data sources via REST APIs with full security compliance.

- Salesforce Developer @ Soft Innovas (03/2023 - 02/2024)
  • Architected backend workflows to synchronize large-scale student and administrative data.
  • Optimized reporting pipelines across multiple systems.
  • Integrated third-party data via REST APIs following internal security standards.

Education:
- B.Sc. Computer Science, Vizja University, Warsaw, Poland (2019-2024, GPA 4.35)
  Thesis: AI-powered banking assistant (NLP, BPMN, UML, mobile integration)
- B.Sc. Computer Science, EPITA Paris, France (2021-2022, GPA 4.04)
  Distributed systems, low-level programming, complex algorithm design

Personal situation & relocation:
- Currently based in Warsaw, Poland
- Does NOT yet hold a German work permit
- Deeply motivated to relocate to Germany; if the company cannot sponsor a work visa,
  the candidate is prepared to self-fund relocation via a Master's degree program or
  a German language course (to obtain the required residence permit), then transition
  to a work contract once settled in Germany
- Open to starting fully remote while the relocation process is underway
- European academic background (Poland + Paris) demonstrates adaptability and comfort
  working within European professional and engineering standards
"""

TAILOR_PROMPT = """You are an expert CV/resume consultant and professional cover letter writer. Help a developer tailor their CV and write a full cover letter for a specific job posting.

Given the candidate's CV and a job posting, provide:
1. A tailored professional summary (2-3 sentences)
2. Top 3 bullet points to REWRITE from their experience to better match the role
3. Top 3-5 skills to highlight for this role
4. Honest skill gaps assessment
5. A match score out of 10
6. A FULL professional cover letter (4 paragraphs, ~280 words). The letter must:
   - Address the hiring manager professionally
   - Open with a strong hook referencing the specific role and company; make it personal and compelling
   - Paragraph 2: Connect 2-3 specific experiences from the CV directly to the job requirements with concrete results
   - Paragraph 3: Address the relocation situation honestly and confidently. The candidate is based in Poland,
     does not yet have a German work permit, but is fully committed to relocating to Germany. If the company
     offers visa sponsorship, that is ideal. If not, the candidate is prepared to come through a Master's program
     or a German language course to obtain residency, and then transition to the role. Frame this as determination
     and long-term commitment, not as a problem. Mention readiness to start fully remote in the meantime.
   - Paragraph 4: Close with genuine enthusiasm for the company and a confident call to action
   - Be written in first person, warm and professional but never robotic or stiff
   - NOT use generic phrases like "I am writing to apply for..." or "I am pleased to submit..."
   - NEVER use double dashes (--); use commas, semicolons, or periods instead
   - NEVER use em dashes either; rephrase the sentence instead

Respond ONLY with this JSON — no markdown, no extra text:
{
  "match_score": 7,
  "tailored_summary": "...",
  "emphasized_bullets": [
    {"original": "...", "rewritten": "..."},
    {"original": "...", "rewritten": "..."},
    {"original": "...", "rewritten": "..."}
  ],
  "skills_to_highlight": ["Node.js", "TypeScript", "Python"],
  "skill_gaps": ["Docker", "Kubernetes"],
  "cover_letter": "Dear Hiring Manager,\\n\\n[paragraph 1 - hook]\\n\\n[paragraph 2 - experience match]\\n\\n[paragraph 3 - relocation situation, honest and confident]\\n\\n[paragraph 4 - enthusiasm and call to action]\\n\\nBest regards,\\nSalih Yazar"
}"""


class TailorRequest(BaseModel):
    job_title: str
    company: str
    description: str
    location: Optional[str] = ""


@app.post("/api/tailor-cv")
async def tailor_cv(req: TailorRequest):
    job_text = f"Job Title: {req.job_title}\nCompany: {req.company}\nLocation: {req.location}\n\nJob Description:\n{req.description[:4000]}"

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=[{"type": "text", "text": TAILOR_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[
                {"role": "user", "content": f"CANDIDATE CV:\n{CV_TEXT}\n\n---\n\nJOB POSTING:\n{job_text}"}
            ],
        )
        raw = response.content[0].text.strip()

        # Extract JSON
        import re
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health():
    return {"status": "ok"}
