import logging
import time
from typing import Any

import pandas as pd
from jobspy import scrape_jobs
from pydantic import ValidationError

from .models import JobSpyPosting

logger = logging.getLogger(__name__)

"""TECH_ROLES = [
    "data engineer",
    "software engineer",
    "data analyst",
    "data scientist",
    "devops engineer",
]"""

TECH_ROLES = [
    # Data & AI / ML
    "data engineer",
    "data analyst",
    "data scientist",
    "machine learning engineer",
    "analytics engineer",
    "ai engineer",
    "business intelligence developer",
    # Software Engineering & Development
    "software engineer",
    "backend developer",
    "frontend developer",
    "full stack developer",
    "python developer",
    "java developer",
    "mobile app developer",
    # Cloud, DevOps & Infrastructure
    "devops engineer",
    "cloud engineer",
    "cloud architect",
    "site reliability engineer",  # SRE
    "platform engineer",
    "systems administrator",
    # Cybersecurity & Networks
    "cyber security engineer",
    "security analyst",
    "network engineer",
    # Quality, Agile & Product Management
    "qa engineer",
    "test automation engineer",
    "scrum master",
    "product owner",
    "solution architect",
]


def fetch_jobspy_raw(
    roles: list[str] = TECH_ROLES,
    location: str = "Netherlands",
    country_indeed="Netherlands",
    results_wanted_per_role: int = 2,
    hours_old: int = 72,
) -> list[dict[str, Any]]:
    """Scrape tech jobs using JobSpy and convert the output into raw dictionaries."""
    all_raw_records: list[dict[str, Any]] = []

    for role in roles:
        logger.info(
            "Fetching JobSpy jobs for role: '%s' in %s (Indeed Country: %s)",
            role,
            location,
            country_indeed,
        )
        try:
            jobs_df: pd.DataFrame = scrape_jobs(
                site_name=["linkedin", "indeed"],
                search_term=role,
                location=location,
                country_indeed=country_indeed,
                results_wanted=results_wanted_per_role,
                hours_old=hours_old,
                linkedin_fetch_description=True,
            )

            if not jobs_df.empty:

                clean_df = jobs_df.where(pd.notnull(jobs_df), None)
                records = clean_df.to_dict(orient="records")
                all_raw_records.extend(records)
                logger.info("Received %d record(s) for role '%s'", len(records), role)

            time.sleep(1)

        except (ConnectionError, TimeoutError, ValueError) as exc:
            logger.error("Failed to fetch jobs for role '%s': %s", role, exc)

    logger.info("Total raw JobSpy records collected: %d", len(all_raw_records))
    return all_raw_records


def parse_records(records: list[dict[str, Any]]) -> tuple[list[JobSpyPosting], int]:
    """Validate raw JobSpy records against Pydantic model, returning valid ones and rejected count."""
    parsed: list[JobSpyPosting] = []
    rejected = 0

    for record in records:
        try:

            validated_record = JobSpyPosting.model_validate(record)
            parsed.append(validated_record)

        except ValidationError as exc:
            rejected += 1

            identifier = (
                record.get("job_url", record.get("title", "<no identifier>"))
                if isinstance(record, dict)
                else repr(record)[:40]
            )
            logger.warning(
                "Rejected JobSpy record '%s': %s errors", identifier, exc.error_count()
            )

    logger.info("Parsed %d record(s) successfully, rejected %d", len(parsed), rejected)
    return parsed, rejected
