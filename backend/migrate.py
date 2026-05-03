from sqlalchemy import text, inspect
from models.db import engine, Base, User, RoadmapHistory, CareerToolHistory


def column_exists(inspector, table_name, column_name):
    """Check if a column already exists in a table."""
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def migrate():
    print("Starting database migration...")

    # 1. Create any tables that don't exist yet
    Base.metadata.create_all(bind=engine)
    print("  [OK] Tables synced")

    # 2. Apply column-level migrations for existing tables
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    with engine.begin() as conn:
        # Add 'progress' column to roadmap_history if missing
        if "roadmap_history" in existing_tables:
            if not column_exists(inspector, "roadmap_history", "progress"):
                conn.execute(text(
                    "ALTER TABLE roadmap_history ADD COLUMN progress TEXT DEFAULT ''"
                ))
                print("  [OK] Added 'progress' column to roadmap_history")
            else:
                print("  [--] 'progress' column already exists, skipping")
        else:
            print("  [OK] roadmap_history table created with all columns")

    print("Migration complete!")


if __name__ == "__main__":
    migrate()
