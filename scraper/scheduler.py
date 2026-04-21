"""
APScheduler-based scheduler that runs all city scrapers every 24h at 3am EST.
Also exports run_all() for manual triggers.
"""
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from scrapers import toronto, vancouver, calgary, montreal, ottawa
from db import upsert_sessions, log_scrape

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SCRAPERS = [
    ("Toronto", toronto.scrape),
    ("Vancouver", vancouver.scrape),
    ("Calgary", calgary.scrape),
    ("Montreal", montreal.scrape),
    ("Ottawa", ottawa.scrape),
]


def run_city(city_name: str, scrape_fn) -> None:
    logger.info(f"Scraping {city_name}…")
    try:
        sessions = scrape_fn()
        upserted = upsert_sessions(sessions)
        log_scrape(city_name, "success", found=len(sessions), upserted=upserted)
        logger.info(f"{city_name}: found={len(sessions)}, upserted={upserted}")
    except Exception as e:
        logger.error(f"{city_name} failed: {e}")
        log_scrape(city_name, "error", error=str(e))


def run_all() -> None:
    for city_name, fn in SCRAPERS:
        run_city(city_name, fn)


def main():
    scheduler = BlockingScheduler(timezone="America/Toronto")
    scheduler.add_job(
        run_all,
        CronTrigger(hour=3, minute=0),
        id="daily_scrape",
        name="Scrape all cities",
        replace_existing=True,
    )
    logger.info("Scheduler started — will scrape daily at 3am EST")
    logger.info("Running initial scrape now…")
    run_all()
    scheduler.start()


if __name__ == "__main__":
    main()
