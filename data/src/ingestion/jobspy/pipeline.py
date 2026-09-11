"""The JobSpy ingestion job: fetch, validate,  land.

Run locally:
    uv run python -m src.ingestion.jobspy.pipeline --local
"""

import argparse
import logging
import os
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from dotenv import load_dotenv


from .ingest import fetch_jobspy_raw, parse_records
from .storage import (
    LOCAL_LANDING_DIR,
    PRODUCTION_CONTAINER,
    PRODUCTION_PREFIX,
    blob_path,
    land_local_json,
    land_raw_json,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("jobspy_pipeline")


SOURCE_NAME = "jobspy"


class MissingSetting(RuntimeError):
    """A required environment variable is not set."""


@dataclass(frozen=True)
class Config:
    """What the JobSpy ingestion job needs."""

    storage_account: str
    databricks_catalog: str
    landing_container: str
    landing_prefix: str


def load_config(local: bool = False) -> Config:
    """Read settings required for JobSpy pipeline."""
    load_dotenv()

    def required(name: str) -> str:
        value = os.getenv(name)
        if not value:
            raise MissingSetting(f"{name} is not set. Copy .env.example to .env and fill it in.")
        return value

    return Config(
        storage_account="" if local else required("STORAGE_ACCOUNT"),
        databricks_catalog=os.getenv("DATABRICKS_CATALOG", "team_b"),
        landing_container=os.getenv("LANDING_CONTAINER", PRODUCTION_CONTAINER),
        landing_prefix=os.getenv("LANDING_PREFIX", PRODUCTION_PREFIX),
    )


def run(run_date: str | None = None, local_dir: Path | None = None) -> int:
    """Run one JobSpy execution and return the number of records landed."""
    config = load_config(local=local_dir is not None)
    run_date = run_date or datetime.now(tz=UTC).date().isoformat()

    # 1. Fetch raw data via JobSpy (Pagination handled internally by JobSpy)
    logger.info("Fetching raw records from JobSpy...")
    raw_records = fetch_jobspy_raw(
        location="Netherlands",
        results_wanted_per_role=10,  # check
        hours_old=72,
    )

    # 2. Validate records against JobSpy Pydantic model
    parsed_models, rejected = parse_records(raw_records)

    # 3. Stop execution if no valid records exist
    if not parsed_models:
        raise RuntimeError(
            f"No valid JobSpy records: {len(raw_records)} received, {rejected} rejected"
        )

    if rejected:
        logger.warning(
            "%d of %d JobSpy records failed validation",
            rejected,
            len(raw_records),
        )

    valid_records = [model.model_dump() for model in parsed_models]

    # 5. Construct destination partition path
    path = blob_path(SOURCE_NAME, run_date, config.landing_prefix)

    if local_dir is not None:
        landed = land_local_json(local_dir, path, valid_records)
        logger.info(
            "JobSpy Pipeline finished: %d written locally, %d rejected.",
            landed,
            rejected,
        )
        return landed

    landed = land_raw_json(
        account=config.storage_account,
        path=path,
        records=valid_records,
        container=config.landing_container,
    )

    logger.info(
        "JobSpy Pipeline finished: %d landed to Azure, %d rejected.",
        landed,
        rejected,
    )
    return landed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run JobSpy ingestion .")

    parser.add_argument(
        "--run-date",
        default=None,
        help="the day this run belongs to, YYYY-MM-DD. Defaults to today.",
    )

    parser.add_argument(
        "--local",
        nargs="?",
        const=LOCAL_LANDING_DIR,
        default=None,
        type=Path,
        metavar="DIR",
        help=f"write the file locally. Defaults to {LOCAL_LANDING_DIR}/.",
    )

    args = parser.parse_args()

    try:
        run(args.run_date, args.local)
    except Exception:
        logger.exception("JobSpy Pipeline failed")
        sys.exit(1)
