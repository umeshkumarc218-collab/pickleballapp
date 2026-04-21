from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from supabase import Client
from auth import get_supabase
from models.schemas import SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=List[SessionOut])
async def list_sessions(
    city: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    age: Optional[str] = Query(None),
    supabase: Client = Depends(get_supabase),
):
    query = (
        supabase.table("sessions")
        .select(
            "*, bookings(count), session_reviews(rating)"
        )
        .eq("is_active", True)
    )

    if city:
        query = query.ilike("city", f"%{city}%")
    if skill and skill.lower() not in ("all", "all levels"):
        query = query.ilike("skill_level", f"%{skill}%")
    if age and age.lower() != "all":
        query = query.ilike("age_group", f"%{age}%")
    if date:
        # filter by day_of_week matching the date
        from datetime import datetime
        try:
            day = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
            query = query.eq("day_of_week", day)
        except ValueError:
            pass

    res = query.order("start_time").execute()
    sessions = []
    for row in res.data or []:
        booked = 0
        if row.get("bookings"):
            booked = row["bookings"][0].get("count", 0) if isinstance(row["bookings"], list) else 0

        ratings = [r["rating"] for r in (row.get("session_reviews") or []) if r.get("rating")]
        avg_rating = sum(ratings) / len(ratings) if ratings else None

        sessions.append(
            SessionOut(
                **{k: v for k, v in row.items() if k not in ("bookings", "session_reviews")},
                booked_count=booked,
                avg_rating=avg_rating,
            )
        )
    return sessions


@router.get("/{session_id}", response_model=SessionOut)
async def get_session(session_id: str, supabase: Client = Depends(get_supabase)):
    res = (
        supabase.table("sessions")
        .select("*, bookings(count), session_reviews(rating)")
        .eq("id", session_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Session not found")

    row = res.data
    booked = 0
    if isinstance(row.get("bookings"), list) and row["bookings"]:
        booked = row["bookings"][0].get("count", 0)

    ratings = [r["rating"] for r in (row.get("session_reviews") or []) if r.get("rating")]
    avg_rating = sum(ratings) / len(ratings) if ratings else None

    return SessionOut(
        **{k: v for k, v in row.items() if k not in ("bookings", "session_reviews")},
        booked_count=booked,
        avg_rating=avg_rating,
    )
