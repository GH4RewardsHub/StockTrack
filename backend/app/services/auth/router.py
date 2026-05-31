from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, SQLModel

from app.database import get_session
from app.models import User
from app.services.auth.utils import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Authentication"])


class UserRegister(SQLModel):
    email: str
    password: str
    name: Optional[str] = None


class UserLogin(SQLModel):
    email: str
    password: str


@router.post("/api/auth/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_data.email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )

    hashed = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/api/auth/login")
def login_user(credentials: UserLogin, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == credentials.email)
    user = session.exec(statement).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials"
        )

    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
