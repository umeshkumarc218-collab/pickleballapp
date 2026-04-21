from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List
from supabase import Client
from auth import get_admin_user, get_supabase
from models.schemas import ScrapeLogOut
import importlib
import sys
import os

router = APIRouter(prefix="/admin", tags=["admin"])


def _run_all_scrapers():
    """Import and run all city scrapers. Called in background."""
    scraper_path = os.path.join(os.path.dirname(__file__), "..", "..", "scraper")
    sys.path.insert(0, os.path.abspath(scraper_path))
    try:
        from scheduler import run_all
        run_all()
    except Exception as e:
        print(f"Scraper error: {e}")
    finally:
        sys.path.pop(0)


@router.post("/scrape")
async def trigger_scrape(
    background_tasks: BackgroundTasks,
    _: dict = Depends(get_admin_user),
):
    background_tasks.add_task(_run_all_scrapers)
    return {"message": "Scrape started in background"}


@router.get("/scrape-logs", response_model=List[ScrapeLogOut])
async def get_scrape_logs(
    _: dict = Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    res = (
        supabase.table("scrape_logs")
        .select("*")
        .order("scraped_at", desc=True)
        .limit(100)
        .execute()
    )
    return [ScrapeLogOut(**row) for row in (res.data or [])]
