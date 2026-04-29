import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

_db = None

def get_db():
    global _db
    if _db is None:
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            if not cred_path or not os.path.exists(cred_path):
                raise FileNotFoundError(
                    f"Firebase service account JSON not found at: {cred_path}\n"
                    "Go to Firebase Console → Project Settings → Service Accounts → Generate new private key"
                )
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db
