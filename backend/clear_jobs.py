from firebase_config import get_db

db = get_db()
docs = db.collection("jobs").stream()
deleted = 0
for doc in docs:
    doc.reference.delete()
    deleted += 1
print(f"Deleted {deleted} old jobs from Firestore")
