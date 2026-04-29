from apscheduler.schedulers.blocking import BlockingScheduler
from main import run_pipeline

scheduler = BlockingScheduler()

# Run every hour
scheduler.add_job(run_pipeline, "interval", hours=1, id="job_pipeline")

if __name__ == "__main__":
    print("[Scheduler] Starting — pipeline will run every hour")
    print("[Scheduler] Running initial pipeline now...")
    run_pipeline()
    scheduler.start()
