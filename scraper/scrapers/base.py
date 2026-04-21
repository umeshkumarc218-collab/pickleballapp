import re
from datetime import datetime


DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

SKILL_KEYWORDS = {
    "beginner": "Beginner",
    "novice": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
    "open": "All Levels",
    "all": "All Levels",
}

AGE_KEYWORDS = {
    "senior": "60+",
    "60+": "60+",
    "55+": "60+",
    "50+": "60+",
    "adult": "19+",
    "19+": "19+",
    "18+": "19+",
}


def normalize_time(raw: str) -> str | None:
    """Convert various time strings to HH:MM 24h format."""
    if not raw:
        return None
    raw = raw.strip().upper()
    for fmt in ("%I:%M %p", "%I:%M%p", "%I %p", "%H:%M", "%H:%M:%S"):
        try:
            t = datetime.strptime(raw, fmt)
            return t.strftime("%H:%M")
        except ValueError:
            continue
    # try removing seconds: "10:30:00 AM"
    raw2 = re.sub(r":\d{2}(\s*[AP]M)", r"\1", raw)
    for fmt in ("%I:%M %p", "%I:%M%p"):
        try:
            t = datetime.strptime(raw2, fmt)
            return t.strftime("%H:%M")
        except ValueError:
            continue
    return raw  # return as-is if unparseable


def detect_skill(text: str) -> str:
    text_lower = text.lower()
    for kw, level in SKILL_KEYWORDS.items():
        if kw in text_lower:
            return level
    return "All Levels"


def detect_age(text: str) -> str:
    text_lower = text.lower()
    for kw, age in AGE_KEYWORDS.items():
        if kw in text_lower:
            return age
    return "All ages"


def is_pickleball(text: str) -> bool:
    return "pickleball" in text.lower()
