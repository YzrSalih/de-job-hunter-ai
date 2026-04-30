<img width="1141" height="926" alt="image" src="https://github.com/user-attachments/assets/eff3791b-9ddf-4744-9b63-48425c3f6f2c" />
<img width="1142" height="942" alt="image" src="https://github.com/user-attachments/assets/2e6c366a-8634-4d16-aeac-b869817078ed" />
DE Job Hunter AI
A personal AI-powered job hunting dashboard for finding English-friendly software developer positions in Germany and Poland. It automatically scrapes multiple job boards, analyzes each listing against your CV using Claude AI, and presents the results in a Kanban board. A dedicated CV Tailor page generates personalized cover letters and rewrites your bullet points for each position.

Features
Multi-source scraping — Pulls listings from No Fluff Jobs, Adzuna, Arbeitnow, Remotive, RemoteOK, Jobicy, and Indeed RSS
AI analysis — Claude Haiku scores each job for tech match, detects German language requirements, and gives an apply / maybe / skip recommendation
Smart filtering — Blocks jobs requiring German, filters out US/non-European locations, and lets Polish-based jobs bypass the English requirement
Kanban board — Organize jobs across New → Applied → Interview → Rejected columns with drag-and-drop status updates
Job detail modal — Click any card to see matched/missing skills, AI summary, and full description
CV Tailor page — Select a job and get a tailored cover letter, rewritten CV bullets, and a downloadable PDF report (powered by Claude Sonnet)
Auto-refresh — Frontend polls Firestore every 5 minutes with a live countdown timer
Salary & workplace info — Shows salary ranges and remote/hybrid/office type on cards (especially for Polish jobs)
Tech Stack
Backend — Python 3.9+, Anthropic SDK (Claude Haiku + Sonnet), Firebase Admin SDK, APScheduler, feedparser, FastAPI

Frontend — React 19, TypeScript, Vite, Tailwind CSS, Firebase Web SDK, React Router, jsPDF

Project Structure

de-job-hunter-ai/
├── backend/
│   ├── main.py              # Pipeline: scrape → analyze → save to Firestore
│   ├── scraper.py           # All job board scrapers
│   ├── analyzer.py          # Claude Haiku job analysis with prompt caching
│   ├── api_server.py        # FastAPI server for CV tailoring (port 8000)
│   ├── cv_profile.json      # Your skills and target roles
│   ├── deduplication.py     # MD5-based URL deduplication
│   ├── firebase_config.py   # Firebase Admin SDK setup
│   ├── scheduler.py         # APScheduler for automatic pipeline runs
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/           # DashboardPage, CVTailorPage
        ├── components/      # KanbanBoard, JobCard, JobModal, Navbar
        ├── hooks/           # useJobs (Firestore + auto-refresh)
        └── types/           # Job, JobAnalysis TypeScript interfaces
Setup
Prerequisites
Python 3.9+
Node.js 18+
A Firebase project with Firestore enabled
An Anthropic API key
An Adzuna API key (free tier at developer.adzuna.com)
Backend

cd backend
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, ADZUNA_APP_ID, ADZUNA_APP_KEY
pip install -r requirements.txt
Place your Firebase service account JSON at backend/firebase-service-account.json.

Run the pipeline once:


python main.py
Or start the scheduler (runs every 6 hours):


python scheduler.py
Start the CV tailor API server:


uvicorn api_server:app --reload --port 8000
Frontend

cd frontend
cp .env.example .env
# Fill in your Firebase web config variables (VITE_FIREBASE_*)
npm install
npm run dev
Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
Customization
Edit backend/cv_profile.json to set your own skills and target roles. The analyzer and CV tailor prompts are both built from this file — updating it automatically personalizes all AI output.
