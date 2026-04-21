import os
import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        _client = create_client(url, key)
    return _client


def upsert_sessions(sessions: list[dict]) -> int:
    """Upsert sessions; returns count of upserted rows."""
    if not sessions:
        return 0
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    enriched = []
    for s in sessions:
        enriched.append({
            "id": s.get("id") or str(uuid.uuid4()),
            "location_name": s["location_name"],
            "address": s.get("address"),
            "city": s["city"],
            "province": s.get("province"),
            "lat": s.get("lat"),
            "lng": s.get("lng"),
            "day_of_week": s.get("day_of_week"),
            "start_time": s.get("start_time"),
            "end_time": s.get("end_time"),
            "age_group": s.get("age_group"),
            "skill_level": s.get("skill_level"),
            "phone": s.get("phone"),
            "capacity": s.get("capacity", 20),
            "is_active": True,
            "updated_at": now,
        })
    res = client.table("sessions").upsert(
        enriched,
        on_conflict="location_name,day_of_week,start_time",
        ignore_duplicates=False,
    ).execute()
    return len(res.data or [])


def log_scrape(city: str, status: str, found: int = 0, upserted: int = 0, error: str = None):
    client = get_client()
    client.table("scrape_logs").insert({
        "id": str(uuid.uuid4()),
        "city": city,
        "status": status,
        "sessions_found": found,
        "sessions_upserted": upserted,
        "error_message": error,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
