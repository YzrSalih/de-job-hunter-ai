<img width="1141" height="926" alt="image" src="https://github.com/user-attachments/assets/eff3791b-9ddf-4744-9b63-48425c3f6f2c" />
<img width="1142" height="942" alt="image" src="https://github.com/user-attachments/assets/2e6c366a-8634-4d16-aeac-b869817078ed" />

A personal AI-powered job hunting dashboard for finding English-friendly software developer positions in Germany and Poland. It automatically scrapes multiple job boards, analyzes each listing against your CV using Claude AI, and presents the results in a Kanban board. A dedicated CV Tailor page generates personalized cover letters and rewrites your bullet points for each position.

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

