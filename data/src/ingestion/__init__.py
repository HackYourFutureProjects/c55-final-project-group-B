"""Fetch from the source, validate, land the raw file. Runs as a container job."""

import logging
import os
import sys

from .adzuna import pipeline as adzuna_pipeline
from .jobspy import pipeline as jobspy_pipeline

logger = logging.getLogger(__name__)


def run() -> int:
    source = os.environ.get("INGEST_SOURCE", "adzuna").strip().lower()

    try:
        if source == "adzuna":
            count = adzuna_pipeline.run()
            logger.info("Adzuna ingestion completed. Landed %s records.", count)
            return 0
        elif source == "jobspy":
            count = jobspy_pipeline.run()
            logger.info("JobSpy ingestion completed. Landed %s records.", count)
            return 0
        else:
            logger.error("Unknown INGEST_SOURCE='%s'. Expected 'adzuna' or 'jobspy'.", source)
            return 1
    except Exception:
        logger.exception("Ingestion failed for source '%s'", source)
        return 1


if __name__ == "__main__":
    sys.exit(run())
