from models.db import engine, Base, User, RoadmapHistory

def migrate():
    print("Starting database migration...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    migrate()
