from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, SQLModel

from app.database import get_session
from app.models import User, Business
from app.services.auth.dependencies import get_current_user

router = APIRouter(tags=["Businesses"])


class BusinessCreate(SQLModel):
    name: str


class BusinessOut(SQLModel):
    id: str
    name: str
    is_active: bool
    created_at: datetime
    created_by_id: str
    locations_count: int = 0
    items_count: int = 0


@router.post("/api/businesses", response_model=Business)
def create_business(
    data: BusinessCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    business = Business(name=data.name, created_by_id=current_user.id)
    session.add(business)
    session.commit()
    session.refresh(business)
    return business


@router.get("/api/businesses", response_model=List[BusinessOut])
def get_businesses(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Business).where(
        Business.created_by_id == current_user.id)
    businesses = session.exec(statement).all()

    out = []
    for b in businesses:
        out.append(BusinessOut(
            id=b.id,
            name=b.name,
            is_active=b.is_active,
            created_at=b.created_at,
            created_by_id=b.created_by_id,
            locations_count=len(b.locations),
            items_count=len(b.stock_items)
        ))
    return out
