import asyncio
import logging

from database import SessionLocal
from fee_fine_automation_service import apply_automatic_fines


logger = logging.getLogger("edunexus.fine_scheduler")

_scheduler_task = None
_scheduler_running = False


async def run_fine_automation():

    global _scheduler_running

    if _scheduler_running:
        logger.warning(
            "Fine automation is already running. Skipping duplicate run."
        )
        return

    _scheduler_running = True

    db = SessionLocal()

    try:
        result = apply_automatic_fines(
            db=db,
            academic_year=None,
        )

        logger.info(
            "Fine automation completed. Created: %s, Skipped: %s",
            result.get("created", 0),
            result.get("skipped", 0),
        )

    except Exception:
        logger.exception(
            "Fine automation scheduler failed."
        )

    finally:
        db.close()
        _scheduler_running = False


async def fine_scheduler_loop():

    while True:

        try:
            await run_fine_automation()

        except Exception:
            logger.exception(
                "Unexpected error in fine scheduler loop."
            )

        # Run once every 24 hours.
        await asyncio.sleep(86400)


def start_fine_scheduler():

    global _scheduler_task

    if _scheduler_task is not None:
        return _scheduler_task

    _scheduler_task = asyncio.create_task(
        fine_scheduler_loop()
    )

    logger.info(
        "Fee fine automation scheduler started."
    )

    return _scheduler_task


async def stop_fine_scheduler():

    global _scheduler_task

    if _scheduler_task is None:
        return

    _scheduler_task.cancel()

    try:
        await _scheduler_task

    except asyncio.CancelledError:
        pass

    _scheduler_task = None

    logger.info(
        "Fee fine automation scheduler stopped."
    )