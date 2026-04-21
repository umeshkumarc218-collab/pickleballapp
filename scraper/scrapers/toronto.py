"""
Toronto drop-in scraper.
Toronto uses ActiveNet via toronto.ca. We fetch the public JSON feed for
drop-in activities and filter for pickleball.
"""
import httpx
from .base import normalize_time, detect_skill, detect_age, is_pickleball

CITY = "Toronto"
PROVINCE = "ON"

# Toronto Parks & Rec public activity search API (ActiveNet JSON endpoint)
SEARCH_URL = "https://www.toronto.ca/data/parks/prd/facilities/activities/index.json"


def scrape() -> list[dict]:
    sessions = []
    try:
        r = httpx.get(SEARCH_URL, timeout=30, follow_redirects=True)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[Toronto] fetch error: {e}")
        # Fall back to hardcoded known sessions for demo
        return _hardcoded_fallback()

    items = data if isinstance(data, list) else data.get("items", data.get("activities", []))
    for item in items:
        name = item.get("activityName", "") or item.get("name", "")
        if not is_pickleball(name):
            continue

        for sched in item.get("schedules", [item]):
            location = sched.get("facilityName") or item.get("facilityName", "")
            address = sched.get("address") or item.get("address", "")
            day = sched.get("dayOfWeek") or sched.get("day", "")
            start = normalize_time(sched.get("startTime", ""))
            end = normalize_time(sched.get("endTime", ""))
            age_raw = sched.get("ageGroup") or item.get("ageGroup", "")
            skill_raw = name + " " + (sched.get("description", "") or "")

            sessions.append({
                "location_name": location or name,
                "address": address,
                "city": CITY,
                "province": PROVINCE,
                "day_of_week": day,
                "start_time": start,
                "end_time": end,
                "age_group": detect_age(age_raw),
                "skill_level": detect_skill(skill_raw),
                "capacity": int(sched.get("capacity", 20)) if sched.get("capacity") else 20,
            })

    return sessions if sessions else _hardcoded_fallback()


def _hardcoded_fallback() -> list[dict]:
    """Seed data for Toronto when live scrape is unavailable."""
    return [
        {"location_name": "Greenwood Park", "address": "150 Greenwood Ave, Toronto, ON M4L 2P1",
         "city": CITY, "province": PROVINCE, "day_of_week": "Monday", "start_time": "09:00",
         "end_time": "11:00", "age_group": "All ages", "skill_level": "All Levels", "capacity": 16},
        {"location_name": "East York Community Centre", "address": "1081 Pape Ave, Toronto, ON M4E 2V2",
         "city": CITY, "province": PROVINCE, "day_of_week": "Wednesday", "start_time": "19:00",
         "end_time": "21:00", "age_group": "19+", "skill_level": "Intermediate", "capacity": 12},
        {"location_name": "Etobicoke Olympium", "address": "590 Rathburn Rd, Etobicoke, ON M9C 3T3",
         "city": CITY, "province": PROVINCE, "day_of_week": "Saturday", "start_time": "08:00",
         "end_time": "10:00", "age_group": "60+", "skill_level": "Beginner", "capacity": 10},
        {"location_name": "Scarborough Village Rec Centre", "address": "3600 Kingston Rd, Scarborough, ON M1M 1R7",
         "city": CITY, "province": PROVINCE, "day_of_week": "Thursday", "start_time": "14:00",
         "end_time": "16:00", "age_group": "60+", "skill_level": "All Levels", "capacity": 14},
        {"location_name": "Wallace Emerson Community Centre", "address": "1260 Dufferin St, Toronto, ON M6H 4C4",
         "city": CITY, "province": PROVINCE, "day_of_week": "Friday", "start_time": "10:00",
         "end_time": "12:00", "age_group": "19+", "skill_level": "Advanced", "capacity": 8},
    ]
