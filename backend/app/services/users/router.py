from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import User
from app.services.auth.dependencies import get_current_user

router = APIRouter(tags=["Users"])


@router.post("/api/users", response_model=User)
def create_user_profile(user_data: User, session: Session = Depends(get_session)):
    existing = session.get(User, user_data.id)
    if existing:
        if user_data.name and existing.name != user_data.name:
            existing.name = user_data.name
        if user_data.email and existing.email != user_data.email:
            existing.email = user_data.email
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    session.add(user_data)
    session.commit()
    session.refresh(user_data)
    return user_data


@router.get("/api/users/me", response_model=User)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/api/users/{uid}", response_model=User)
def get_user_profile(
    uid: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user = session.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
