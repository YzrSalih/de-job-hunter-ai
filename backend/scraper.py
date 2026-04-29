import requests
import feedparser
from datetime import datetime


ARBEITSAGENTUR_TOKEN_URL = "https://rest.arbeitsagentur.de/oauth/gettoken_cc"
ARBEITSAGENTUR_JOBS_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs"

# Public client credentials for the Arbeitsagentur official public API
AA_CLIENT_ID = "c003a37f-024f-462a-b36d-b001be4cd24a"
AA_CLIENT_SECRET = "32a39620-32b3-4307-9aa1-511527533b99"

INDEED_RSS_URL = "https://de.indeed.com/rss?q={query}&l=Germany&sort=date"

SEARCH_QUERIES = [
    "Frontend Developer",
    "Full Stack Developer",
    "React Developer",
    "Software Engineer",
]


def _get_arbeitsagentur_token() -> str:
    resp = requests.post(
        ARBEITSAGENTUR_TOKEN_URL,
        data={"grant_type": "client_credentials"},
        auth=(AA_CLIENT_ID, AA_CLIENT_SECRET),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def scrape_arbeitsagentur() -> list[dict]:
    try:
        token = _get_arbeitsagentur_token()
    except Exception as e:
        print(f"[Arbeitsagentur] Failed to get token: {e}")
        return []

    jobs = []
    for query in SEARCH_QUERIES:
        try:
            resp = requests.get(
                ARBEITSAGENTUR_JOBS_URL,
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "was": query,
                    "angebotsart": 1,
                    "page": 1,
                    "size": 25,
                },
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
            for item in data.get("stellenangebote", []):
                jobs.append({
                    "source": "arbeitsagentur",
                    "title": item.get("titel", ""),
                    "company": item.get("arbeitgeber", ""),
                    "location": item.get("arbeitsort", {}).get("ort", ""),
                    "url": f"https://www.arbeitsagentur.de/jobsuche/jobdetail/{item.get('refnr', '')}",
                    "description": item.get("stellenbeschreibung", ""),
                    "posted_at": item.get("eintrittsdatum", ""),
                    "scraped_at": datetime.utcnow().isoformat(),
                })
        except Exception as e:
            print(f"[Arbeitsagentur] Query '{query}' failed: {e}")

    return jobs


def scrape_indeed_rss() -> list[dict]:
    jobs = []
    for query in SEARCH_QUERIES:
        try:
            url = INDEED_RSS_URL.format(query=query.replace(" ", "+"))
            feed = feedparser.parse(url)
            for entry in feed.entries:
                jobs.append({
                    "source": "indeed",
                    "title": entry.get("title", ""),
                    "company": entry.get("author", ""),
                    "location": "",
                    "url": entry.get("link", ""),
                    "description": entry.get("summary", ""),
                    "posted_at": entry.get("published", ""),
                    "scraped_at": datetime.utcnow().isoformat(),
                })
        except Exception as e:
            print(f"[Indeed RSS] Query '{query}' failed: {e}")

    return jobs


def scrape_all() -> list[dict]:
    print("[Scraper] Scanning Arbeitsagentur...")
    aa_jobs = scrape_arbeitsagentur()
    print(f"[Scraper] Arbeitsagentur: {len(aa_jobs)} listings found")

    print("[Scraper] Scanning Indeed RSS...")
    indeed_jobs = scrape_indeed_rss()
    print(f"[Scraper] Indeed: {len(indeed_jobs)} listings found")

    return aa_jobs + indeed_jobs
