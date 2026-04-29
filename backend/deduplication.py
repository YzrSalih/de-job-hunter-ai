import hashlib
from firebase_config import get_db


def make_job_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()


def is_duplicate(job_id: str) -> bool:
    db = get_db()
    doc = db.collection("jobs").document(job_id).get()
    return doc.exists
