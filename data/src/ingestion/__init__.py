"""Fetch from both Adzuna and JobSpy sources sequentially."""

import logging

from .adzuna import pipeline as adzuna_pipeline
from .jobspy import pipeline as jobspy_pipeline

logger = logging.getLogger(__name__)


def run() -> int:
    """Run both sources, one after another. Returns total records landed.

    Each source is isolated: if one fails, its count is 0 (contributing
    nothing to the total) but the other source still runs and still lands
    its data. The caller finds out something failed via the log, not by
    losing the other source's successful run.
    """
    total = 0

    for name, pipeline in (("Adzuna", adzuna_pipeline), ("JobSpy", jobspy_pipeline)):
        logger.info("Starting %s ingestion...", name)
        try:
            count = pipeline.run()
            logger.info("%s ingestion landed %d records.", name, count)
            total += count
        except Exception:
            logger.exception("%s ingestion failed", name)

    logger.info("Ingestion complete. Total landed records: %d", total)
    return total
