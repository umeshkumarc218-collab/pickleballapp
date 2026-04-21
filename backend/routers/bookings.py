from fastapi import APIRouter, Depends, HTTPException
from typing import List
from supabase import Client
from auth import get_current_user, get_supabase
from models.schemas import BookingCreate, BookingOut, SessionOut
import uuid

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
async def create_booking(
    body: BookingCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # Check for existing booking
    existing = (
        supabase.table("bookings")
        .select("id, status")
        .eq("user_id", current_user["id"])
        .eq("session_id", body.session_id)
        .eq("session_date", body.session_date.isoformat())
        .in_("status", ["confirmed", "waitlisted"])
        .execute()
    )
    if existing.data:
        raise HTTPException(400, "Already booked for this session")

    # Get session capacity
    session_res = (
        supabase.table("sessions")
        .select("capacity")
        .eq("id", body.session_id)
        .single()
        .execute()
    )
    if not session_res.data:
        raise HTTPException(404, "Session not found")

    capacity = session_res.data.get("capacity", 20)

    # Count confirmed bookings for this session+date
    booked_res = (
        supabase.table("bookings")
        .select("id", count="exact")
        .eq("session_id", body.session_id)
        .eq("session_date", body.session_date.isoformat())
        .eq("status", "confirmed")
        .execute()
    )
    booked_count = booked_res.count or 0

    if booked_count >= capacity:
        # Waitlist
        wl_count_res = (
            supabase.table("bookings")
            .select("id", count="exact")
            .eq("session_id", body.session_id)
            .eq("session_date", body.session_date.isoformat())
            .eq("status", "waitlisted")
            .execute()
        )
        position = (wl_count_res.count or 0) + 1
        booking = (
            supabase.table("bookings")
            .insert({
                "id": str(uuid.uuid4()),
                "user_id": current_user["id"],
                "session_id": body.session_id,
                "session_date": body.session_date.isoformat(),
                "status": "waitlisted",
                "waitlist_position": position,
            })
            .execute()
        )
    else:
        booking = (
            supabase.table("bookings")
            .insert({
                "id": str(uuid.uuid4()),
                "user_id": current_user["id"],
                "session_id": body.session_id,
                "session_date": body.session_date.isoformat(),
                "status": "confirmed",
            })
            .execute()
        )

    return BookingOut(**booking.data[0])


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    res = (
        supabase.table("bookings")
        .select("id, user_id, status")
        .eq("id", booking_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Booking not found")
    if res.data["user_id"] != current_user["id"]:
        raise HTTPException(403, "Not your booking")

    supabase.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()
    return {"message": "Booking cancelled"}


@router.get("/me", response_model=List[BookingOut])
async def my_bookings(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    res = (
        supabase.table("bookings")
        .select("*, session:sessions(*)")
        .eq("user_id", current_user["id"])
        .neq("status", "cancelled")
        .order("session_date", desc=True)
        .execute()
    )

    bookings = []
    for row in res.data or []:
        # Check if user has reviewed this session
        review_res = (
            supabase.table("session_reviews")
            .select("id")
            .eq("user_id", current_user["id"])
            .eq("session_id", row["session_id"])
            .execute()
        )
        has_review = bool(review_res.data)

        session_data = row.pop("session", None)
        session_obj = SessionOut(**session_data) if session_data else None

        bookings.append(BookingOut(**row, session=session_obj, has_review=has_review))

    return bookings
