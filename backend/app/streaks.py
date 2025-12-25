from datetime import datetime, date
from sqlalchemy.orm import Session
from . import models

POINTS_PER_TASK = 10


def update_user_streak_and_points(
    db: Session,
    user: models.User,
    completed_at: datetime,
):
    """Update user's streak and points when they complete a task."""
    if completed_at is None:
        return

    completion_day: date = completed_at.date()
    last_day: date | None = user.last_active_date

    # Update streak
    if last_day is None:
        # First ever completion
        user.current_streak = 1
    else:
        diff = (completion_day - last_day).days
        if diff == 0:
            # Same day -> streak unchanged
            pass
        elif diff == 1:
            # Consecutive day -> streak +1
            user.current_streak += 1
        else:
            # Gap -> streak reset
            user.current_streak = 1

    # Update longest streak
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak

    # Update last active day
    user.last_active_date = completion_day

    # Add points
    user.total_points += POINTS_PER_TASK

    db.add(user)
