from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from . import models, schemas
from .database import engine, get_db
from .auth_utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    verify_proof_image
)
from .streaks import update_user_streak_and_points
from .ai_verifier import ai_verify_proof


# Create DB tables
models.Base.metadata.create_all(bind=engine)


app = FastAPI(title="TaskSure API")

# Allow frontend calls
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ---------------- AUTH HELPERS ----------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user = db.get(models.User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------------- ROOT ----------------

@app.get("/")
def read_root():
    return {"message": "TaskSure API is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---------------- AUTH ----------------

@app.post("/auth/register", response_model=schemas.UserOut)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


# ---------------- STATS ----------------

@app.get("/stats/me", response_model=schemas.UserStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks_completed = (
        db.query(models.Task)
        .filter(models.Task.owner_id == current_user.id, models.Task.status == "completed")
        .count()
    )

    return {
        "total_points": current_user.total_points,
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "tasks_completed": tasks_completed,
    }


# ---------------- TASK CRUD ----------------

@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        due_date=task_in.due_date,
        owner_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status

    # Update fields
    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.status is not None:
        task.status = task_in.status

    # Streak update
    if task.status == "completed" and old_status != "completed":
        task.completed_at = datetime.utcnow()
        update_user_streak_and_points(db, current_user, task.completed_at)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return


# ---------------- LEADERBOARD ----------------

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = (
        db.query(models.User)
        .order_by(models.User.total_points.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "username": user.username,
            "total_points": user.total_points,
            "current_streak": user.current_streak,
        }
        for user in users
    ]
@app.get("/calendar/me")
def calendar_event_me(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from datetime import datetime, timedelta

    today = datetime.utcnow().date()
    start = today - timedelta(days=60)

    logs = (
        db.query(models.StreakLog)
        .filter(models.StreakLog.user_id == current_user.id)
        .filter(models.StreakLog.date >= start)
        .all()
    )

    return [
        {"date": log.date.isoformat(), "points": log.points}
        for log in logs
    ]
@app.get("/streak/calendar")
def streak_calendar(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.owner_id == current_user.id,
            models.Task.status == "completed",
            models.Task.completed_at.isnot(None),
        )
        .all()
    )

    calendar = {}

    for task in tasks:
        day = task.completed_at.date().isoformat()
        calendar[day] = calendar.get(day, 0) + 1

    return calendar


# ---------------- PROOF UPLOAD + AI CHECK ----------------
@app.post("/tasks/{task_id}/proof", response_model=schemas.TaskOut)
async def upload_task_proof(
    task_id: int,
    proof_text: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    upload_dir = os.path.join(os.path.dirname(__file__), "..", "proof_uploads")
    os.makedirs(upload_dir, exist_ok=True)

    if file:
        filename = f"task_{task.id}_{datetime.utcnow().timestamp()}_{file.filename}"
        saved_path = os.path.join(upload_dir, filename)
        with open(saved_path, "wb") as f:
            f.write(await file.read())

        task.proof_url = saved_path
        task.proof_type = "image"

    if proof_text:
        task.proof_text = proof_text
        if not task.proof_type:
            task.proof_type = "text"

    # ✅ SMART PROOF DECISION
    approved = False
    feedback = ""

    if task.proof_text and len(task.proof_text.strip()) >= 30:
        approved = True
        feedback = "Proof accepted based on detailed text verification."
    else:
        approved, feedback = ai_verify_proof(
            task.proof_text,
            task.proof_url,
            task_title=task.title,
            task_description=task.description,
        )

    task.proof_feedback = feedback

    if approved:
        task.proof_status = "approved"

        if task.status != "completed":
            task.status = "completed"
            task.completed_at = datetime.utcnow()
            update_user_streak_and_points(db, current_user, task.completed_at)
    else:
        task.proof_status = "rejected"

    db.commit()
    db.refresh(task)

    return task   # ✅ INSIDE FUNCTION
