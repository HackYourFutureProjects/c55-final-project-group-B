"""The ingestion job: fetch, validate, enrich, land. This is what the container runs.

    uv run python -m src.ingestion.pipeline [--run-date YYYY-MM-DD]

Settings come from the environment: .env on your machine, the job definition in
Azure. Every one is a name or a URL. There is no secret here, because the job
authenticates as itself. See the README, "Settings".
"""

import argparse
import logging
import os
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from dotenv import load_dotenv

from .enrich import enrich_records
from .ingest import fetch_all_pages, parse_records
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
logger = logging.getLogger("pipeline")

# Landing-folder name under LANDING_PREFIX (local / aca-dev / prod raw).
# Same in every environment for a single source — not an env var.
SOURCE_NAME = "postings"


class MissingSetting(RuntimeError):
    """A required environment variable is not set."""


@dataclass(frozen=True)
class Config:
    """What the ingestion job needs. Names only, no credentials."""

    source_api_url: str
    # Empty only for a --local run, which never opens a connection to Azure.
    storage_account: str
    databricks_catalog: str
    landing_container: str
    landing_prefix: str


def load_config(local: bool = False) -> Config:
    """Read settings, failing at startup rather than ten minutes in.

    A local run needs the source and nothing else. Demanding a storage account
    to write a file to your own disk would put the cloud in the way of the one
    step that exists to get a look at a new API before any of it is set up.
    """
    load_dotenv()

    def required(name: str) -> str:
        value = os.getenv(name)
        if not value:
            raise MissingSetting(f"{name} is not set. Copy .env.example to .env and fill it in.")
        return value

    return Config(
        source_api_url=required("SOURCE_API_URL"),
        storage_account="" if local else required("STORAGE_ACCOUNT"),
        databricks_catalog=os.getenv("DATABRICKS_CATALOG", "team_b"),
        landing_container=os.getenv("LANDING_CONTAINER", PRODUCTION_CONTAINER),
        landing_prefix=os.getenv("LANDING_PREFIX", PRODUCTION_PREFIX),
    )


def run(run_date: str | None = None, local_dir: Path | None = None) -> int:
    """Run one execution and return the number of records landed."""
    config = load_config(local=local_dir is not None)
    run_date = run_date or datetime.now(tz=UTC).date().isoformat()

    # 1. Fetch raw data across all pages
    raw_records = fetch_all_pages(country_code="nl", max_pages=5, results_per_page=50)

    # 2. Validate records against Pydantic model
    parsed, rejected = parse_records(raw_records)

    # 3. Stop execution if no valid records exist
    if not parsed:
        raise RuntimeError(f"No valid records: {len(raw_records)} received, {rejected} rejected")

    if rejected:
        logger.warning(
            "%d of %d records failed validation and are still being processed",
            rejected,
            len(raw_records),
        )

    # 4. Enrich records via LLM API calls
    logger.info("Enriching %d records with LLM...", len(raw_records))
    enriched_records = enrich_records(raw_records)

    # 5. Construct destination partition path
    path = blob_path(SOURCE_NAME, run_date, config.landing_prefix)

    # 6. Land enriched records (local disk or Azure)
    if local_dir is not None:
        landed = land_local_json(local_dir, path, enriched_records)
        logger.info(
            "Pipeline finished: %d written locally, %d rejected.",
            landed,
            rejected,
        )
        return landed

    landed = land_raw_json(
        account=config.storage_account,
        path=path,
        records=enriched_records,
        container=config.landing_container,
    )

    landing_root = os.getenv("LANDING_PATH")
    readable = (
        f"{landing_root.rstrip('/')}/{SOURCE_NAME}"
        if landing_root
        else "(set LANDING_PATH so dbt reads what you just wrote)"
    )
    logger.info(
        "Pipeline finished: %d landed, %d rejected, readable at %s",
        landed,
        rejected,
        readable,
    )
    return landed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run one ingestion with LLM enrichment.")

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
        help=(
            "write the file to this machine instead of the landing zone. "
            f"Defaults to {LOCAL_LANDING_DIR}/."
        ),
    )

    args = parser.parse_args()

    try:
        run(args.run_date, args.local)
    except Exception:
        logger.exception("Pipeline failed")
        sys.exit(1)
