import asyncio
from datetime import datetime, timezone

from database import SessionLocal
from school_intelligence_service import create_school_intelligence_snapshot


SNAPSHOT_INTERVAL_SECONDS = 24 * 60 * 60

_scheduler_task = None
_scheduler_running = False


def create_daily_snapshot():
    db = SessionLocal()

    try:
        snapshot = create_school_intelligence_snapshot(db)

        print(
            "[EduNexus Intelligence] Snapshot created:",
            snapshot.id,
            snapshot.snapshot_date,
        )

        return snapshot

    except Exception as exc:
        db.rollback()
        print(
            "[EduNexus Intelligence] Snapshot failed:",
            str(exc),
        )
        raise

    finally:
        db.close()


async def _snapshot_loop():
    global _scheduler_running

    _scheduler_running = True

    while _scheduler_running:
        try:
            create_daily_snapshot()
        except Exception as exc:
            print(
                "[EduNexus Intelligence] Scheduler error:",
                str(exc),
            )

        await asyncio.sleep(
            SNAPSHOT_INTERVAL_SECONDS
        )


def start_intelligence_scheduler():
    global _scheduler_task

    if _scheduler_task is not None:
        return

    _scheduler_task = asyncio.create_task(
        _snapshot_loop()
    )

    print(
        "[EduNexus Intelligence] Snapshot scheduler started"
    )


async def stop_intelligence_scheduler():
    global _scheduler_task
    global _scheduler_running

    _scheduler_running = False

    if _scheduler_task is not None:
        _scheduler_task.cancel()

        try:
            await _scheduler_task
        except asyncio.CancelledError:
            pass

        _scheduler_task = None

    print(
        "[EduNexus Intelligence] Snapshot scheduler stopped"
    )