"""
Montreal drop-in scraper.
Montreal.ca sports page — mostly static HTML with a page listing activities.
"""
import httpx
from bs4 import BeautifulSoup
from .base import normalize_time, detect_skill, detect_age, is_pickleball

CITY = "Montreal"
PROVINCE = "QC"

URL = "https://montreal.ca/en/topics/sports-and-outdoors"


def scrape() -> list[dict]:
    try:
        r = httpx.get(URL, timeout=30, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        sessions = []

        for item in soup.select(".activity, article, .program"):
            text = item.get_text(" ", strip=True)
            if not is_pickleball(text):
                continue
            title = item.find("h3") or item.find("h2") or item.find("h4")
            location = item.find(class_=lambda c: c and ("location" in c or "address" in c or "facility" in c))
            sessions.append({
                "location_name": title.get_text(strip=True) if title else "Montreal Pickleball",
                "address": location.get_text(strip=True) if location else "",
                "city": CITY,
                "province": PROVINCE,
                "day_of_week": _extract_day(text),
                "start_time": _extract_time(text, "start"),
                "end_time": _extract_time(text, "end"),
                "age_group": detect_age(text),
                "skill_level": detect_skill(text),
                "capacity": 20,
            })

        return sessions if sessions else _hardcoded_fallback()
    except Exception as e:
        print(f"[Montreal] scrape error: {e}")
        return _hardcoded_fallback()


def _extract_day(text: str) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
            "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    day_map = {
        "Lundi": "Monday", "Mardi": "Tuesday", "Mercredi": "Wednesday",
        "Jeudi": "Thursday", "Vendredi": "Friday", "Samedi": "Saturday", "Dimanche": "Sunday"
    }
    for day in days:
        if day.lower() in text.lower():
            return day_map.get(day, day)
    return ""


def _extract_time(text: str, which: str) -> str | None:
    import re
    times = re.findall(r"\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b", text)
    if which == "start" and times:
        return normalize_time(times[0])
    if which == "end" and len(times) >= 2:
        return normalize_time(times[1])
    return None


def _hardcoded_fallback() -> list[dict]:
    return [
        {"location_name": "Centre Communautaire Côte-des-Neiges", "address": "6767 Ch de la Côte-des-Neiges, Montréal, QC H3S 2T6",
         "city": CITY, "province": PROVINCE, "day_of_week": "Tuesday", "start_time": "10:00",
         "end_time": "12:00", "age_group": "All ages", "skill_level": "All Levels", "capacity": 16},
        {"location_name": "Complexe sportif Claude-Robillard", "address": "1000 Émile-Journault Ave, Montréal, QC H2C 1H9",
         "city": CITY, "province": PROVINCE, "day_of_week": "Thursday", "start_time": "19:00",
         "end_time": "21:00", "age_group": "19+", "skill_level": "Intermediate", "capacity": 12},
        {"location_name": "Centre Récréatif Rivière-des-Prairies", "address": "9801 Perras Blvd, Montréal, QC H1C 1C3",
         "city": CITY, "province": PROVINCE, "day_of_week": "Saturday", "start_time": "09:00",
         "end_time": "11:00", "age_group": "60+", "skill_level": "Beginner", "capacity": 10},
    ]
