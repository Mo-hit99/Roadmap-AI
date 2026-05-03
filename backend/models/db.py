import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

def _normalize_database_url(url):
    if not url:
        raise ValueError("DATABASE_URL is not set.")
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL"))

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    Base.metadata.create_all(bind=engine)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    roadmaps = relationship("RoadmapHistory", back_populates="user")
    career_tools = relationship("CareerToolHistory", back_populates="user")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class RoadmapHistory(Base):
    __tablename__ = "roadmap_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal = Column(String, nullable=False)
    skills = Column(Text, nullable=False)
    hours = Column(Integer, nullable=False)
    deadline = Column(String, nullable=False)
    success_score = Column(Float, nullable=False)
    roadmap_content = Column(Text, nullable=False)
    progress = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")

class CareerToolHistory(Base):
    __tablename__ = "career_tool_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tool_type = Column(String, nullable=False) # 'mentor_chat', 'daily_plan', 'job_match', 'resume', 'skill_gap'
    title = Column(String, nullable=False) # e.g. "Chat with Mentor", "Resume for Backend Dev"
    content = Column(Text, nullable=False) # JSON string of the result
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="career_tools")
