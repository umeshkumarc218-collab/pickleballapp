from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from supabase import Client
from auth import get_current_user, get_supabase
from models.schemas import EventCreate, EventOut
import uuid

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/events", response_model=List[EventOut])
async def list_events(
    city: Optional[str] = Query(None),
    supabase: Client = Depends(get_supabase),
    current_user: Optional[dict] = Depends(lambda: None),
):
    query = supabase.table("community_events").select(
        "*, event_participants(count)"
    ).order("event_date")

    if city:
        query = query.ilike("city", f"%{city}%")

    res = query.execute()
    events = []
    for row in res.data or []:
        participant_count = 0
        if isinstance(row.get("event_participants"), list) and row["event_participants"]:
            participant_count = row["event_participants"][0].get("count", 0)

        events.append(
            EventOut(
                **{k: v for k, v in row.items() if k != "event_participants"},
                participant_count=participant_count,
                is_joined=False,
            )
        )
    return events


@router.post("/events", response_model=EventOut)
async def create_event(
    body: EventCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    data = {
        "id": str(uuid.uuid4()),
        "creator_id": current_user["id"],
        **body.model_dump(exclude_none=True),
    }
    if "event_date" in data and data["event_date"]:
        data["event_date"] = data["event_date"].isoformat()

    res = supabase.table("community_events").insert(data).execute()
    if not res.data:
        raise HTTPException(500, "Failed to create event")

    row = res.data[0]
    return EventOut(**row, participant_count=0, is_joined=False)


@router.post("/events/{event_id}/join")
async def join_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # Check already joined
    existing = (
        supabase.table("event_participants")
        .select("event_id")
        .eq("event_id", event_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    if existing.data:
        raise HTTPException(400, "Already joined this event")

    # Check capacity
    event_res = (
        supabase.table("community_events")
        .select("max_participants")
        .eq("id", event_id)
        .single()
        .execute()
    )
    if not event_res.data:
        raise HTTPException(404, "Event not found")

    max_p = event_res.data.get("max_participants")
    if max_p:
        count_res = (
            supabase.table("event_participants")
            .select("event_id", count="exact")
            .eq("event_id", event_id)
            .execute()
        )
        if (count_res.count or 0) >= max_p:
            raise HTTPException(400, "Event is full")

    supabase.table("event_participants").insert({
        "event_id": event_id,
        "user_id": current_user["id"],
    }).execute()

    return {"message": "Joined successfully"}
