from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# For now we use SQLite file database
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasksure.db"

# For SQLite only: check_same_thread=False
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
from sqlalchemy.orm import Session

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
