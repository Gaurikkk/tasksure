from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from typing import Optional, List



# ---------- User Schemas ----------

class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # allows returning ORM objects


# ---------- Auth Schemas ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------- Task Schemas ----------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"        # low | medium | high
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None              # pending | completed


class TaskOut(TaskBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    owner_id: int

    # 🔹 NEW
    completed_at: Optional[datetime] = None
    proof_type: Optional[str] = None
    proof_text: Optional[str] = None
    proof_url: Optional[str] = None
    proof_status: Optional[str] = None
    proof_submitted_at: Optional[datetime] = None
    proof_feedback: Optional[str] = None  # 🔹 NEW

    class Config:
        from_attributes = True

class UserStats(BaseModel):
  total_points: int
  current_streak: int
  longest_streak: int
  tasks_completed: int
