from scraper import scrape_all
from analyzer import analyze_job
from deduplication import make_job_id, is_duplicate
from firebase_config import get_db
from datetime import datetime

POLAND_SOURCES = {"nofluffjobs"}


def run_pipeline():
    print(f"\n{'='*50}")
    print(f"[Pipeline] Started at: {datetime.utcnow().isoformat()}")

    jobs = scrape_all()
    print(f"[Pipeline] Total scraped: {len(jobs)} listings")

    db = get_db()
    saved = 0
    skipped_duplicate = 0
    skipped_analysis = 0

    for job in jobs:
        job_id = make_job_id(job["url"])

        if is_duplicate(job_id):
            skipped_duplicate += 1
            continue

        print(f"[Pipeline] Analyzing: {job['title']} @ {job['company']}")
        analysis = analyze_job(job)

        if analysis is None:
            skipped_analysis += 1
            continue

        # German language requirement is always a dealbreaker
        if analysis.get("german_required"):
            print(f"[Pipeline] Skipped (German required): {job['title']}")
            continue

        # For Polish jobs (candidate already there): skip English-friendly check
        is_poland_job = job.get("source") in POLAND_SOURCES
        if not is_poland_job and not analysis.get("is_english_friendly"):
            print(f"[Pipeline] Skipped (not English-friendly): {job['title']}")
            continue

        doc = {
            **job,
            "analysis": analysis,
            "status": "new",
            "job_id": job_id,
        }

        db.collection("jobs").document(job_id).set(doc)
        saved += 1
        print(f"[Pipeline] Saved [{analysis['recommendation']}]: {job['title']}")

    print(f"\n[Pipeline] Done — Saved: {saved} | Duplicates: {skipped_duplicate} | Analysis errors: {skipped_analysis}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    run_pipeline()
