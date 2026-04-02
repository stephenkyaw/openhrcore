"""Dramatiq broker configuration with Redis backend."""

from __future__ import annotations

import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.middleware import (
    AgeLimit,
    Callbacks,
    Pipelines,
    Retries,
    ShutdownNotifications,
    TimeLimit,
)

from src.config import get_settings

settings = get_settings()

broker = RedisBroker(url=settings.REDIS_URL)
broker.middleware = [
    AgeLimit(),
    TimeLimit(),
    ShutdownNotifications(),
    Callbacks(),
    Pipelines(),
    Retries(min_backoff=1_000, max_backoff=600_000, max_retries=10),
]
dramatiq.set_broker(broker)


@dramatiq.actor(max_retries=3, min_backoff=10_000, time_limit=300_000)  # type: ignore[misc]
def example_task(payload: dict[str, object]) -> None:
    """Placeholder task demonstrating broker wiring. Replace with real tasks."""
    import structlog

    logger = structlog.get_logger()
    logger.info("worker.task_received", payload=payload)
