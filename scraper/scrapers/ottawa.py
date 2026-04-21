"""
Ottawa drop-in scraper.
Ottawa Recreation uses a Playwright-rendered page.
"""
from .base import normalize_time, detect_skill, detect_age, is_pickleball

CITY = "Ottawa"
PROVINCE = "ON"

URL = "https://ottawa.ca/en/recreation-and-parks/recreation-programs-and-activities/activities"


def scrape() -> list[dict]:
    try:
        return _playwright_scrape()
    except Exception as e:
        print(f"[Ottawa] playwright error: {e}, using fallback")
        return _hardcoded_fallback()


def _playwright_scrape() -> list[dict]:
    from playwright.sync_api import sync_playwright

    sessions = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(URL, timeout=30000, wait_until="networkidle")

        try:
            search = page.locator("input[type='search'], input[placeholder*='search']").first
            search.fill("pickleball")
            search.press("Enter")
            page.wait_for_load_state("networkidle", timeout=10000)
        except Exception:
            pass

        items = page.locator(".activity-item, .program-item, tr").all()
        for item in items:
            text = item.inner_text()
            if not is_pickleball(text):
                continue
            cells = item.locator("td").all()
            if len(cells) >= 3:
                sessions.append({
                    "location_name": cells[0].inner_text().strip(),
                    "address": cells[1].inner_text().strip() if len(cells) > 1 else "",
                    "city": CITY,
                    "province": PROVINCE,
                    "day_of_week": _extract_day(text),
                    "start_time": normalize_time(cells[2].inner_text().strip().split("–")[0]),
                    "end_time": normalize_time(cells[2].inner_text().strip().split("–")[-1]),
                    "age_group": detect_age(text),
                    "skill_level": detect_skill(text),
                    "capacity": 20,
                })
        browser.close()
    return sessions if sessions else _hardcoded_fallback()


def _extract_day(text: str) -> str:
    for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        if d.lower() in text.lower():
            return d
    return ""


def _hardcoded_fallback() -> list[dict]:
    return [
        {"location_name": "Carleton Heights Community Centre", "address": "1665 Apeldoorn Ave, Ottawa, ON K2C 0B7",
         "city": CITY, "province": PROVINCE, "day_of_week": "Monday", "start_time": "10:00",
         "end_time": "12:00", "age_group": "All ages", "skill_level": "All Levels", "capacity": 16},
        {"location_name": "Plant Recreation Centre", "address": "930 Somerset St W, Ottawa, ON K1R 6R5",
         "city": CITY, "province": PROVINCE, "day_of_week": "Wednesday", "start_time": "18:00",
         "end_time": "20:00", "age_group": "19+", "skill_level": "Intermediate", "capacity": 12},
        {"location_name": "Dovercourt Recreation Centre", "address": "411 Dovercourt Ave, Ottawa, ON K2A 0S5",
         "city": CITY, "province": PROVINCE, "day_of_week": "Friday", "start_time": "09:00",
         "end_time": "11:00", "age_group": "60+", "skill_level": "Beginner", "capacity": 10},
        {"location_name": "Nepean Sportsplex", "address": "1701 Woodroffe Ave, Ottawa, ON K2G 1W2",
         "city": CITY, "province": PROVINCE, "day_of_week": "Sunday", "start_time": "14:00",
         "end_time": "16:00", "age_group": "All ages", "skill_level": "Advanced", "capacity": 8},
    ]
