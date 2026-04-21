from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from auth import get_current_user, get_supabase
from models.schemas import ReviewCreate
import uuid

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("")
async def submit_review(
    body: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # One review per user per session
    existing = (
        supabase.table("session_reviews")
        .select("id")
        .eq("user_id", current_user["id"])
        .eq("session_id", body.session_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(400, "Already reviewed this session")

    res = supabase.table("session_reviews").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "session_id": body.session_id,
        "rating": body.rating,
        "comment": body.comment,
    }).execute()

    if not res.data:
        raise HTTPException(500, "Failed to save review")

    return {"message": "Review submitted", "id": res.data[0]["id"]}
