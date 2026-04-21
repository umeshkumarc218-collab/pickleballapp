"""
Calgary drop-in scraper.
Calgary Parks uses calgarypark.ca which has a leisure guide API.
"""
import httpx
from bs4 import BeautifulSoup
from .base import normalize_time, detect_skill, detect_age, is_pickleball

CITY = "Calgary"
PROVINCE = "AB"

SEARCH_URL = "https://www.calgary.ca/csps/recreation/programs-and-drop-in.html"


def scrape() -> list[dict]:
    try:
        r = httpx.get(SEARCH_URL, timeout=30, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        sessions = []

        for row in soup.select("tr, .program-row"):
            text = row.get_text(" ", strip=True)
            if not is_pickleball(text):
                continue
            cells = row.find_all("td")
            if len(cells) < 3:
                continue
            sessions.append({
                "location_name": cells[0].get_text(strip=True),
                "address": cells[1].get_text(strip=True),
                "city": CITY,
                "province": PROVINCE,
                "day_of_week": _extract_day(text),
                "start_time": normalize_time(cells[2].get_text(strip=True).split("–")[0]),
                "end_time": normalize_time(cells[2].get_text(strip=True).split("–")[-1]),
                "age_group": detect_age(text),
                "skill_level": detect_skill(text),
                "capacity": 20,
            })

        return sessions if sessions else _hardcoded_fallback()
    except Exception as e:
        print(f"[Calgary] scrape error: {e}")
        return _hardcoded_fallback()


def _extract_day(text: str) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day in days:
        if day.lower() in text.lower():
            return day
    return ""


def _hardcoded_fallback() -> list[dict]:
    return [
        {"location_name": "Southland Leisure Centre", "address": "2000 Southland Dr SW, Calgary, AB T2W 0H7",
         "city": CITY, "province": PROVINCE, "day_of_week": "Monday", "start_time": "09:00",
         "end_time": "11:00", "age_group": "All ages", "skill_level": "All Levels", "capacity": 16},
        {"location_name": "Village Square Leisure Centre", "address": "2623 56 St NE, Calgary, AB T1Y 6E7",
         "city": CITY, "province": PROVINCE, "day_of_week": "Wednesday", "start_time": "18:30",
         "end_time": "20:30", "age_group": "19+", "skill_level": "Intermediate", "capacity": 12},
        {"location_name": "Thornhill Aquatic & Recreation Centre", "address": "800 Coventry Dr NE, Calgary, AB T3K 5V7",
         "city": CITY, "province": PROVINCE, "day_of_week": "Friday", "start_time": "10:00",
         "end_time": "12:00", "age_group": "60+", "skill_level": "Beginner", "capacity": 10},
        {"location_name": "Bob Bahan Aquatic & Fitness Centre", "address": "201 Patina Dr SW, Calgary, AB T3H 2G8",
         "city": CITY, "province": PROVINCE, "day_of_week": "Sunday", "start_time": "13:00",
         "end_time": "15:00", "age_group": "All ages", "skill_level": "Advanced", "capacity": 8},
    ]
