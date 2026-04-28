import os
from dotenv import load_dotenv

load_dotenv()

def _normalize_database_url(url):
    if not url:
        return None
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    # Database
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(os.getenv("DATABASE_URL"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # App settings
    DEBUG = os.getenv("DEBUG", "True") == "True"
