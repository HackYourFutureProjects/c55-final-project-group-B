"""Fetch records from the Adzuna API, handle pagination, and validate them using Pydantic."""

# In case we dont have company_name: Rejected or We can extract the name from description or to put the name with unkowun.

import logging
import os
import time
from typing import Any

import requests
from pydantic import ValidationError

from .models import Posting

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 10
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


# This is the old fetch_raw function, which is now replaced by the new one with retry logic and pagination support.
"""def fetch_raw(url: str) -> list[Any]:
    #Call the source API and return its raw records. Non-2xx raises.
    logger.info("Fetching %s", url)
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload = response.json()
    # Some sources wrap their rows in {"data": [...]}, others return the list.
    records = payload.get("data", payload) if isinstance(payload, dict) else payload
    if not isinstance(records, list):
        raise TypeError(f"Expected a list of records, got {type(records).__name__}")
    logger.info("Received %d record(s)", len(records))
    return records"""


# THis is the new fetch_raw function, which includes retry logic and pagination support.and accepts parameters for the API call.
def fetch_raw(url: str, params: dict, max_retries: int = 3) -> list[Any]:
    """Call the source API and return its raw records with retry logic.

    Non-2xx raises.
    """
    # Try fetching up to 3 times in case the network drops or the server is busy
    for attempt in range(max_retries):
        try:
            logger.info("Fetching %s", url)

            # Make the actual API call with our parameters and set a 10s timeout
            response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)

            # If the request worked smoothly
            if response.status_code == 200:
                logger.info(f"Successfully fetched data from {url}")
                payload = response.json()

                # Adzuna wraps its list of jobs inside a 'results' key, so we pull that out
                records = payload.get("results", payload) if isinstance(payload, dict) else payload

                # Double check that we actually got a list back before moving on
                if not isinstance(records, list):
                    raise TypeError(f"Expected a list of records, got {type(records).__name__}")

                logger.info("Received %d record(s)", len(records))
                return records

            # If the server is temporarily overloaded or rate limiting us
            if response.status_code in RETRYABLE_STATUS_CODES:
                # Wait a bit longer after each failed try (1s, then 2s, then 4s...)
                wait_time = 2**attempt
                logger.warning(
                    "Got status %d, retrying (%d/%d) in %ds...",
                    response.status_code,
                    attempt + 1,
                    max_retries,
                    wait_time,
                )
                time.sleep(wait_time)
                continue

            # If it's a permanent error (like a wrong API key or bad URL), don't retry and just throw the error
            response.raise_for_status()

        except requests.exceptions.RequestException as e:
            # If we used up all our retries and it still failed, log it and give up
            if attempt == max_retries - 1:
                logger.error("Failed to fetch %s after retries: %s", url, e)
                raise

    # Fallback to an empty list if nothing came back
    return []


def fetch_all_pages(
    country_code: str,
    max_pages: int,
    results_per_page: int,
) -> list[Any]:
    """Paginate through Adzuna endpoints to collect raw records across multiple pages."""
    # Grab API credentials and base URL from environment variables
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    base_url = os.environ.get(
        "SOURCE_API_URL",
        "https://api.adzuna.com/v1/api/jobs/{country_code}/search/{page}",
    )

    # Make sure we actually have keys before trying to hit the API
    if not app_id or not app_key:
        raise ValueError("ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables must be set.")

    # Set up standard query parameters that Adzuna expects on every request
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": results_per_page,
        "content-type": "application/json",
    }

    all_raw_records = []

    # Loop through the pages one by one (e.g., page 1 to 5)
    for page in range(1, max_pages + 1):
        # Plug the current country code and page number into the URL template
        target_url = base_url.format(country_code=country_code, page=page)

        # Call our helper function to fetch records for this specific page
        records = fetch_raw(url=target_url, params=params)

        # If a page returns no records (or fails), stop paging early
        if not records:
            logger.info("No more records returned on page %d. Stopping.", page)
            break

        # Combine the new page of jobs into our master list
        all_raw_records.extend(records)

        # Be nice to the API by pausing 1 second between page requests
        time.sleep(1)

    logger.info("Total raw records collected: %d", len(all_raw_records))
    return all_raw_records


# This is the old parse_records function, which is now replaced by the new one that includes more detailed logging and error handling.
"""def parse_records(records: list[Any]) -> tuple[list[Posting], int]:
    #Validate raw records, returning the good ones and a rejected count.

    #One malformed record must not lose the whole batch, so invalid rows are
    #counted and skipped. `Any` is deliberate: this is the boundary, and the
    #source can send anything.
    
    parsed: list[Posting] = []
    rejected = 0
    for record in records:
        try:
            parsed.append(Posting.model_validate(record))
        except ValidationError as exc:
            rejected += 1
            # A JSON list can hold a scalar, and .get on one would raise here
            # and lose the batch this loop exists to save.
            identifier = (
                record.get("slug", "<no slug>") if isinstance(record, dict) else repr(record)[:40]
            )
            logger.warning("Rejected record %s: %s", identifier, exc.error_count())
    logger.info("Parsed %d record(s), rejected %d", len(parsed), rejected)
    return parsed, rejected"""


def parse_records(records: list[Any]) -> tuple[list[Posting], int]:
    """Validate raw records against Pydantic Posting model, returning valid ones and rejected count."""
    parsed: list[Posting] = []
    rejected = 0

    # Loop through each raw record we got from the API
    for record in records:
        try:
            # Try to validate and map the record into our Pydantic Posting model
            parsed.append(Posting.model_validate(record))
        except ValidationError as exc:
            # If a record fails validation, count it as rejected so it doesn't break the whole batch
            rejected += 1

            # Grab the job ID if it's a dict, otherwise fallback to a snippet of the record
            identifier = (
                record.get("id", "<no id>") if isinstance(record, dict) else repr(record)[:40]
            )

            # Log a warning showing which record failed and how many validation errors it had
            logger.warning("Rejected record %s: %s errors", identifier, exc.error_count())

    logger.info("Parsed %d record(s), rejected %d", len(parsed), rejected)
    return parsed, rejected
