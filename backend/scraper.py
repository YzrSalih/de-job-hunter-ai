import os
import requests
import feedparser
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

SEARCH_KEYWORDS = [
    # Frontend
    "frontend", "front-end", "front end",
    "react", "react native", "vue", "angular", "next.js",
    # Backend
    "backend", "back-end", "back end",
    "node.js", "nodejs", "python", "java", "spring boot",
    # Fullstack
    "fullstack", "full stack", "full-stack",
    # AI / Data
    "ai developer", "ai engineer", "ml engineer", "machine learning",
    "ai agent", "llm", "data engineer", "data pipeline",
    "data scientist", "data analyst",
    # General
    "software engineer", "software developer",
    "typescript", "javascript",
]

BLOCKED_LOCATIONS = [
    "united states", "usa", "us only", "canada", "australia",
    "india", "israel", "brazil", "latin america", "mexico",
    "uk only", "united kingdom only", "japan", "singapore",
    "new zealand", "south africa",
]

ALLOWED_LOCATIONS = [
    # Worldwide / remote
    "worldwide", "world wide", "anywhere", "global", "remote", "",
    # Europe general
    "europe", "eu", "european union", "central europe",
    # Germany
    "germany", "berlin", "munich", "münchen", "hamburg",
    "frankfurt", "cologne", "düsseldorf", "stuttgart", "leipzig",
    # Poland
    "poland", "warszawa", "warsaw", "kraków", "krakow",
    "wrocław", "wroclaw", "gdańsk", "gdansk", "poznań", "poznan",
    "łódź", "lodz", "katowice", "gdynia",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
}


def _is_location_allowed(location: str) -> bool:
    loc = location.lower().strip()
    if not loc:
        return True
    if any(blocked in loc for blocked in BLOCKED_LOCATIONS):
        return False
    if any(allowed in loc for allowed in ALLOWED_LOCATIONS):
        return True
    return True


def _keyword_match(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in SEARCH_KEYWORDS)


def _normalize(job: dict) -> dict:
    return {
        "source": job.get("source", ""),
        "title": job.get("title", ""),
        "company": job.get("company", ""),
        "location": job.get("location", ""),
        "country": job.get("country", ""),
        "url": job.get("url", ""),
        "description": job.get("description", ""),
        "posted_at": job.get("posted_at", ""),
        "scraped_at": datetime.utcnow().isoformat(),
        "tags": job.get("tags", []),
        "salary": job.get("salary", ""),
        "workplace_type": job.get("workplace_type", ""),
    }


def scrape_arbeitnow() -> List[Dict]:
    """Arbeitnow — English-friendly jobs in Germany. No auth required."""
    jobs = []
    try:
        resp = requests.get("https://www.arbeitnow.com/api/job-board-api", timeout=15)
        resp.raise_for_status()
        for item in resp.json().get("data", []):
            if not _keyword_match(item.get("title", "") + item.get("description", "")):
                continue
            jobs.append(_normalize({
                "source": "arbeitnow",
                "title": item.get("title", ""),
                "company": item.get("company_name", ""),
                "location": item.get("location", "Germany"),
                "url": item.get("url", ""),
                "description": item.get("description", ""),
                "posted_at": str(item.get("created_at", "")),
                "tags": item.get("tags", []),
            }))
    except Exception as e:
        print(f"[Arbeitnow] Failed: {e}")
    return jobs


def scrape_remotive() -> List[Dict]:
    """Remotive — remote-friendly jobs, Europe/worldwide only."""
    jobs = []
    for category in ["software-dev", "frontend", "full-stack", "backend"]:
        try:
            resp = requests.get(
                "https://remotive.com/api/remote-jobs",
                params={"category": category, "limit": 50},
                timeout=15,
            )
            resp.raise_for_status()
            for item in resp.json().get("jobs", []):
                loc = item.get("candidate_required_location", "")
                if not _is_location_allowed(loc):
                    continue
                if not _keyword_match(item.get("title", "")):
                    continue
                jobs.append(_normalize({
                    "source": "remotive",
                    "title": item.get("title", ""),
                    "company": item.get("company_name", ""),
                    "location": loc or "Worldwide / Remote",
                    "url": item.get("url", ""),
                    "description": item.get("description", ""),
                    "posted_at": item.get("publication_date", ""),
                    "tags": item.get("tags", []),
                }))
        except Exception as e:
            print(f"[Remotive] '{category}' failed: {e}")
    return jobs


def scrape_remoteok() -> List[Dict]:
    """RemoteOK — remote jobs worldwide. No auth required."""
    jobs = []
    try:
        resp = requests.get(
            "https://remoteok.com/api",
            headers=HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        # First item is a notice/metadata object, skip it
        for item in data[1:]:
            if not isinstance(item, dict):
                continue
            if not _keyword_match(item.get("position", "") + " ".join(item.get("tags", []))):
                continue
            jobs.append(_normalize({
                "source": "remoteok",
                "title": item.get("position", ""),
                "company": item.get("company", ""),
                "location": "Remote",
                "url": item.get("url", ""),
                "description": item.get("description", ""),
                "posted_at": item.get("date", ""),
                "tags": item.get("tags", []),
            }))
    except Exception as e:
        print(f"[RemoteOK] Failed: {e}")
    return jobs


def scrape_jobicy() -> List[Dict]:
    """Jobicy — remote jobs, filter for Europe/worldwide."""
    jobs = []
    try:
        resp = requests.get(
            "https://jobicy.com/api/v2/remote-jobs",
            params={"count": 50, "geo": "europe"},
            timeout=15,
        )
        resp.raise_for_status()
        for item in resp.json().get("jobs", []):
            industry = item.get("jobIndustry", "")
            if isinstance(industry, list):
                industry = " ".join(industry)
            if not _keyword_match(item.get("jobTitle", "") + industry):
                continue
            jobs.append(_normalize({
                "source": "jobicy",
                "title": item.get("jobTitle", ""),
                "company": item.get("companyName", ""),
                "location": item.get("jobGeo", "Europe / Remote"),
                "url": item.get("url", ""),
                "description": item.get("jobDescription", ""),
                "posted_at": item.get("pubDate", ""),
                "tags": [],
            }))
    except Exception as e:
        print(f"[Jobicy] Failed: {e}")
    return jobs


def scrape_indeed_rss() -> List[Dict]:
    """Indeed Germany — RSS feed for software developer jobs."""
    jobs = []
    queries = [
        "software+developer+germany",
        "frontend+developer+germany",
        "fullstack+developer+germany",
        "ai+developer+germany",
    ]
    for query in queries:
        try:
            url = f"https://de.indeed.com/rss?q={query}&sort=date&fromage=7"
            feed = feedparser.parse(url)
            for entry in feed.entries:
                if not _keyword_match(entry.get("title", "") + entry.get("summary", "")):
                    continue
                jobs.append(_normalize({
                    "source": "indeed",
                    "title": entry.get("title", ""),
                    "company": entry.get("author", ""),
                    "location": "Germany",
                    "url": entry.get("link", ""),
                    "description": entry.get("summary", ""),
                    "posted_at": entry.get("published", ""),
                }))
        except Exception as e:
            print(f"[Indeed RSS] '{query}' failed: {e}")
    return jobs


def scrape_adzuna() -> List[Dict]:
    """Adzuna — Germany-wide job search. Covers Stepstone, Indeed, and more."""
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        print("[Adzuna] Missing credentials")
        return []

    jobs = []
    queries = [
        "software developer",
        "frontend developer",
        "full stack developer",
        "AI developer",
        "backend developer",
    ]

    for query in queries:
        try:
            resp = requests.get(
                "https://api.adzuna.com/v1/api/jobs/de/search/1",
                params={
                    "app_id": app_id,
                    "app_key": app_key,
                    "results_per_page": 20,
                    "what": query,
                    "content-type": "application/json",
                    "sort_by": "date",
                },
                timeout=15,
            )
            resp.raise_for_status()
            for item in resp.json().get("results", []):
                url = item.get("redirect_url", "")
                if not url:
                    continue
                location = item.get("location", {}).get("display_name", "Germany")
                jobs.append(_normalize({
                    "source": "adzuna",
                    "title": item.get("title", ""),
                    "company": item.get("company", {}).get("display_name", ""),
                    "location": location,
                    "url": url,
                    "description": item.get("description", ""),
                    "posted_at": item.get("created", ""),
                    "tags": item.get("category", {}).get("label", ""),
                }))
        except Exception as e:
            print(f"[Adzuna] '{query}' failed: {e}")

    return jobs


def scrape_nofluffjobs() -> List[Dict]:
    """No Fluff Jobs — Poland's top tech job board. Free public API, no auth."""
    jobs = []
    categories = "backend-development,frontend-development,fullstack,ai-ml-big-data,mobile-development"
    try:
        resp = requests.get(
            "https://nofluffjobs.com/api/posting",
            params={"criteria": f"category={categories}", "page": 1, "pageSize": 100},
            headers=HEADERS,
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        seen_ids = set()
        postings = sorted(data.get("postings", []), key=lambda x: x.get("posted", 0), reverse=True)
        for item in postings:
            title = item.get("title", "")
            technology = item.get("technology", "")
            skills = [t["value"] for t in item.get("tiles", {}).get("values", []) if t.get("type") == "requirement"]
            skill_str = " ".join(skills)

            if not _keyword_match(title + " " + technology + " " + skill_str):
                continue

            # Location
            fully_remote = item.get("fullyRemote", False)
            places = item.get("location", {}).get("places", [])
            country_codes = list({p.get("country", {}).get("code", "").upper() for p in places})
            cities = [p.get("city", "") for p in places if p.get("city")]
            primary_city = cities[0] if cities else ""

            if fully_remote:
                location_str = "Remote (Poland)"
                workplace = "remote"
            elif item.get("location", {}).get("hybridDesc"):
                location_str = f"{primary_city}, Poland" if primary_city else "Poland"
                workplace = "hybrid"
            else:
                location_str = f"{primary_city}, Poland" if primary_city else "Poland"
                workplace = "office"

            salary_data = item.get("salary", {})
            salary = ""
            if salary_data and salary_data.get("from") and salary_data.get("to"):
                s_from = int(salary_data["from"])
                s_to = int(salary_data["to"])
                currency = salary_data.get("currency", "PLN")
                s_type = salary_data.get("type", "")
                salary = f"{s_from:,}-{s_to:,} {currency}/mo ({s_type})"

            job_url = item.get("url", "")
            jobs.append(_normalize({
                "source": "nofluffjobs",
                "title": title,
                "company": item.get("name", ""),
                "location": location_str,
                "country": "pl",
                "url": f"https://nofluffjobs.com/job/{job_url}",
                "description": f"{technology} | Skills: {skill_str}",
                "posted_at": str(item.get("posted", "")),
                "tags": skills,
                "salary": salary,
                "workplace_type": workplace,
            }))
    except Exception as e:
        print(f"[No Fluff Jobs] Failed: {e}")
    return jobs


def scrape_all() -> List[Dict]:
    results = {}

    sources = [
        ("No Fluff Jobs (Poland Tech)", scrape_nofluffjobs),
        ("Adzuna (Germany-wide)", scrape_adzuna),
        ("Arbeitnow (Germany, English)", scrape_arbeitnow),
        ("Remotive (Europe/Remote)", scrape_remotive),
        ("RemoteOK (Worldwide Remote)", scrape_remoteok),
        ("Jobicy (Europe Remote)", scrape_jobicy),
        ("Indeed Germany (RSS)", scrape_indeed_rss),
    ]

    for name, fn in sources:
        print(f"[Scraper] Scanning {name}...")
        jobs = fn()
        print(f"[Scraper] → {len(jobs)} listings found")
        for job in jobs:
            if job["url"] not in results:
                results[job["url"]] = job

    print(f"[Scraper] Total unique listings: {len(results)}")
    return list(results.values())
