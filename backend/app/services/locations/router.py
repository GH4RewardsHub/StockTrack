from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, SQLModel

from app.database import get_session
from app.models import User, Business, Location
from app.services.auth.dependencies import get_current_user

router = APIRouter(tags=["Locations"])


class LocationCreate(SQLModel):
    name: str
    description: Optional[str] = None
    type: str = "store"
    address: Optional[str] = None
    is_active: bool = True


@router.post("/api/businesses/{business_id}/locations", response_model=Location)
def create_business_location(
    business_id: str,
    data: LocationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    business = session.get(Business, business_id)
    if not business or business.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this business")

    location = Location(
        name=data.name,
        description=data.description,
        type=data.type,
        address=data.address,
        is_active=data.is_active,
        business_id=business_id
    )
    session.add(location)
    session.commit()
    session.refresh(location)
    return location


@router.get("/api/businesses/{business_id}/locations", response_model=List[Location])
def get_business_locations(
    business_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    business = session.get(Business, business_id)
    if not business or business.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this business")

    statement = select(Location).where(Location.business_id == business_id)
    return session.exec(statement).all()


@router.put("/api/businesses/{business_id}/locations/{location_id}", response_model=Location)
def update_business_location(
    business_id: str,
    location_id: str,
    data: LocationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    business = session.get(Business, business_id)
    if not business or business.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this business")

    location = session.get(Location, location_id)
    if not location or location.business_id != business_id:
        raise HTTPException(status_code=404, detail="Location not found")

    location.name = data.name
    location.description = data.description
    location.type = data.type
    location.address = data.address
    location.is_active = data.is_active

    session.add(location)
    session.commit()
    session.refresh(location)
    return location


@router.delete("/api/businesses/{business_id}/locations/{location_id}")
def delete_business_location(
    business_id: str,
    location_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    business = session.get(Business, business_id)
    if not business or business.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this business")

    location = session.get(Location, location_id)
    if not location or location.business_id != business_id:
        raise HTTPException(status_code=404, detail="Location not found")

    session.delete(location)
    session.commit()
    return {"message": "Location deleted successfully"}
