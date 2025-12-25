from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
    Date,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base




class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # NEW: gamification fields
    total_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)

    # relationship
    tasks = relationship("Task", back_populates="owner")



class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    priority = Column(String, default="medium")  # low | medium | high
    status = Column(String, default="pending")   # pending | completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    completed_at = Column(DateTime, nullable=True)

    # 🔹 NEW: proof-related fields
    proof_type = Column(String, nullable=True)        # "image" | "text" | None
    proof_text = Column(Text, nullable=True)
    proof_url = Column(String, nullable=True)         # file path if image saved
    proof_status = Column(String, default="none")     # none | pending | approved | rejected
    proof_submitted_at = Column(DateTime, nullable=True)
    proof_feedback = Column(Text, nullable=True)  # 🔹 NEW: AI explanation
    proof_image = Column(String, nullable=True)
    rejection_reason = Column(String, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")


