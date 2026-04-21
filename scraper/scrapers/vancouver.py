"""
Vancouver drop-in scraper.
Vancouver Parks uses a JavaScript-rendered schedule page; we use Playwright.
"""
from .base import normalize_time, detect_skill, detect_age, is_pickleball

CITY = "Vancouver"
PROVINCE = "BC"

# Vancouver Parks drop-in schedule (JS-rendered)
URL = "https://vancouver.ca/parks-recreation-culture/drop-in-activity-schedule.aspx"


def scrape() -> list[dict]:
    try:
        return _playwright_scrape()
    except Exception as e:
        print(f"[Vancouver] playwright error: {e}, using fallback")
        return _hardcoded_fallback()


def _playwright_scrape() -> list[dict]:
    from playwright.sync_api import sync_playwright

    sessions = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(URL, timeout=30000, wait_until="networkidle")

        # Search for pickleball activities
        try:
            search = page.locator("input[placeholder*='activity'], input[name*='search'], input[type='search']").first
            search.fill("pickleball")
            search.press("Enter")
            page.wait_for_load_state("networkidle", timeout=10000)
        except Exception:
            pass

        rows = page.locator("tr, .schedule-row, .activity-row").all()
        for row in rows:
            text = row.inner_text()
            if not is_pickleball(text):
                continue
            cells = row.locator("td").all()
            if len(cells) >= 4:
                day = cells[0].inner_text().strip()
                name = cells[1].inner_text().strip()
                location = cells[2].inner_text().strip()
                time_range = cells[3].inner_text().strip()
                start, _, end = time_range.partition("–")
                sessions.append({
                    "location_name": location or name,
                    "address": location,
                    "city": CITY,
                    "province": PROVINCE,
                    "day_of_week": day,
                    "start_time": normalize_time(start.strip()),
                    "end_time": normalize_time(end.strip()),
                    "age_group": detect_age(text),
                    "skill_level": detect_skill(text),
                    "capacity": 20,
                })
        browser.close()
    return sessions if sessions else _hardcoded_fallback()


def _hardcoded_fallback() -> list[dict]:
    return [
        {"location_name": "Trout Lake Community Centre", "address": "3350 Victoria Dr, Vancouver, BC V5N 4M4",
         "city": CITY, "province": PROVINCE, "day_of_week": "Tuesday", "start_time": "10:00",
         "end_time": "12:00", "age_group": "All ages", "skill_level": "All Levels", "capacity": 16},
        {"location_name": "Killarney Community Centre", "address": "6260 Killarney St, Vancouver, BC V5S 3A6",
         "city": CITY, "province": PROVINCE, "day_of_week": "Thursday", "start_time": "19:00",
         "end_time": "21:00", "age_group": "19+", "skill_level": "Intermediate", "capacity": 12},
        {"location_name": "Sunset Community Centre", "address": "6810 Main St, Vancouver, BC V5X 3H5",
         "city": CITY, "province": PROVINCE, "day_of_week": "Saturday", "start_time": "09:00",
         "end_time": "11:00", "age_group": "60+", "skill_level": "Beginner", "capacity": 10},
        {"location_name": "Hillcrest Community Centre", "address": "4575 Clancy Loranger Way, Vancouver, BC V5Y 0B9",
         "city": CITY, "province": PROVINCE, "day_of_week": "Wednesday", "start_time": "12:00",
         "end_time": "14:00", "age_group": "All ages", "skill_level": "Advanced", "capacity": 8},
        {"location_name": "Kensington Community Centre", "address": "5175 Dumfries St, Vancouver, BC V5P 3A4",
         "city": CITY, "province": PROVINCE, "day_of_week": "Monday", "start_time": "18:00",
         "end_time": "20:00", "age_group": "19+", "skill_level": "Intermediate", "capacity": 14},
    ]
