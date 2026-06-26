from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "metodologiasutn_db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
