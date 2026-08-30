"""Validation at the edge: what survives, what is rejected, what is counted.

Tests for `src/ingestion/ingest.py` and `src/ingestion/models.py`.
Validates Pydantic parsing rules, timezone awareness, and record rejection tracking.
"""

from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from src.ingestion.ingest import parse_records
from src.ingestion.models import Posting

# Adzuna job payload fixture
GOOD = {
    "id": "12345",
    "title": "Data Engineer",
    "created": 1786481729,
    "company": {"display_name": "Acme"},
    "location": {"display_name": "Amsterdam", "area": ["Amsterdam", "Netherlands"]},
    "category": {"label": "IT Jobs", "tag": "it-jobs"},
    "description": "Build pipelines.",
}


def test_good_record_survives():
    """Valid records parse successfully without increments to rejected count."""
    parsed, rejected = parse_records([GOOD])
    assert rejected == 0
    assert len(parsed) == 1
    assert parsed[0].id == "12345"


def test_one_bad_record_does_not_lose_the_batch():
    """Incomplete records are dropped and counted as rejected without halting the pipeline."""
    parsed, rejected = parse_records([GOOD, {"id": "missing-required-fields"}])
    assert len(parsed) == 1
    assert rejected == 1


def test_a_scalar_in_the_list_is_rejected_not_fatal():
    """Non-dict items in payload list are captured as rejections without crashing."""
    parsed, rejected = parse_records([GOOD, "not-a-dict", 42])
    assert len(parsed) == 1
    assert rejected == 2


def test_epoch_seconds_become_an_aware_datetime():
    """Ensures epoch integer converts to a UTC timezone-aware datetime instance."""
    posting = Posting.model_validate(GOOD)
    assert posting.created.tzinfo is not None
    assert posting.created == datetime(2026, 8, 11, 20, 55, 29, tzinfo=UTC)


def test_missing_required_field_is_rejected():
    """Omitting mandatory top-level keys triggers a Pydantic ValidationError."""
    bad_payload = {k: v for k, v in GOOD.items() if k != "title"}
    with pytest.raises(ValidationError):
        Posting.model_validate(bad_payload)
