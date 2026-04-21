from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, time, datetime
from uuid import UUID


class SessionOut(BaseModel):
    id: str
    location_name: str
    address: Optional[str] = None
    city: str
    province: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    age_group: Optional[str] = None
    skill_level: Optional[str] = None
    phone: Optional[str] = None
    capacity: int = 20
    is_active: bool = True
    booked_count: int = 0
    avg_rating: Optional[float] = None
    distance: Optional[float] = None


class BookingCreate(BaseModel):
    session_id: str
    session_date: date


class BookingOut(BaseModel):
    id: str
    user_id: str
    session_id: str
    session_date: Optional[date] = None
    status: str
    waitlist_position: Optional[int] = None
    created_at: Optional[datetime] = None
    session: Optional[SessionOut] = None
    has_review: bool = False


class EventCreate(BaseModel):
    title: str
    skill_level: Optional[str] = "All Levels"
    city: str
    address: Optional[str] = None
    event_date: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    max_participants: Optional[int] = None
    description: Optional[str] = None


class EventOut(BaseModel):
    id: str
    creator_id: str
    title: str
    skill_level: Optional[str] = None
    city: str
    address: Optional[str] = None
    event_date: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    max_participants: Optional[int] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    participant_count: int = 0
    is_joined: bool = False


class ReviewCreate(BaseModel):
    session_id: str
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not (1 <= v <= 5):
            raise ValueError("Rating must be 1-5")
        return v


class ScrapeLogOut(BaseModel):
    id: str
    city: str
    status: str
    sessions_found: Optional[int] = None
    sessions_upserted: Optional[int] = None
    error_message: Optional[str] = None
    scraped_at: Optional[datetime] = None
