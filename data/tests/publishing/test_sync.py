"""The publish step: type mapping, schema stamping, and the atomic table swap order.

Tests for `src/publishing/sync.py`. Validates zero-downtime swaps so backend
APIs never query a missing or partially filled table.
"""

import pytest
from conftest import FakeWarehouse

from src.publishing import sync

# 1. Matching your actual fct_postings mart columns and data types
COLUMNS = [
    ("job_id", "STRING"),
    ("title", "STRING"),
    ("company_name", "STRING"),
    ("description", "STRING"),
    ("location_city", "STRING"),
    ("location_province", "STRING"),
    ("latitude", "DECIMAL(9,6)"),
    ("longitude", "DECIMAL(9,6)"),
    ("created", "TIMESTAMP"),
    ("redirect_url", "STRING"),
    ("is_category_known", "BOOLEAN"),
    ("category_label", "STRING"),
    ("category_tag", "STRING"),
    ("salary_min", "NUMERIC"),
    ("salary_max", "NUMERIC"),
    ("salary_display", "STRING"),
    ("salary_note", "STRING"),
    ("ingested_at", "TIMESTAMP"),
]

# Mock data row aligned with your schema
ROWS = [
    [
        "job_12345",
        "Data Engineer",
        "Tech Corp",
        "Job description text",
        "Amsterdam",
        "North Holland",
        52.3676,
        4.9041,
        "2026-08-29T10:00:00Z",
        "https://example.com/job/12345",
        True,
        "Algemeen",
        "Data Engineering",
        45000.00,
        65000.00,
        "€45,000 - €65,000",
        "Stated by employer",
        "2026-08-29T10:30:00Z",
    ]
]


class FakeCursor:
    def __init__(self, log: list[str]) -> None:
        self.log = log

    def execute(self, statement, params=None):
        self.log.append(" ".join(statement.as_string().split()))

    def executemany(self, statement, rows):
        self.log.append(f"INSERT x{len(list(rows))}")

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return None


class FakeConnection:
    def __init__(self) -> None:
        self.log: list[str] = []
        self.committed = False
        self.closed = False

    def cursor(self):
        return FakeCursor(self.log)

    def commit(self):
        self.committed = True

    def close(self):
        self.closed = True


@pytest.fixture
def connection(monkeypatch) -> FakeConnection:
    fake = FakeConnection()
    monkeypatch.setattr(sync.psycopg, "connect", lambda *a, **k: fake)
    return fake


def test_type_mapping():
    assert sync.postgres_type("BIGINT") == "bigint"
    assert sync.postgres_type("DECIMAL(5,1)") == "numeric"
    assert sync.postgres_type("TIMESTAMP") == "timestamptz"


def test_unknown_type_becomes_text():
    """Unrecognized types fallback to text without failing the publishing step."""
    assert sync.postgres_type("ARRAY<STRING>") == "text"
    assert sync.postgres_type("MAP<STRING,INT>") == "text"


def index_of(statements: list[str], fragment: str) -> int:
    for position, statement in enumerate(statements):
        if fragment in statement:
            return position
    raise AssertionError(f"No statement contained {fragment!r}: {statements}")


def test_publish_swaps_in_the_right_order(connection):
    """Load staging first, drop old, rename staging last."""
    count = sync.publish("dsn", "analytics", "fct_postings", COLUMNS, ROWS)
    assert count == 1

    statements = connection.log
    staging_created = index_of(statements, "create table")
    inserted = index_of(statements, "INSERT")
    dropped = index_of(statements, 'drop table if exists "analytics"."fct_postings"')
    renamed = index_of(statements, "rename to")

    assert staging_created < inserted < dropped < renamed
    assert connection.committed


def test_first_publish_works_with_no_existing_table(connection):
    sync.publish("dsn", "analytics", "fct_postings", COLUMNS, ROWS)
    drop = connection.log[
        index_of(connection.log, 'drop table if exists "analytics"."fct_postings"')
    ]
    assert "if exists" in drop


def test_publishing_zero_rows_is_refused(connection):
    """Prevents zero-row overwrites in production."""
    with pytest.raises(ValueError, match="zero rows"):
        sync.publish("dsn", "analytics", "fct_postings", COLUMNS, [])
    assert connection.log == []


def test_reading_an_empty_mart_is_refused():
    warehouse = FakeWarehouse()
    with pytest.raises(ValueError, match="no rows"):
        sync.read_mart(warehouse, "main", "fct_postings")


def test_the_source_schema_is_stamped_on_the_table(connection):
    """Verifies that the databricks source schema (team_b.dev_mareh) is recorded in table comments."""
    sync.publish(
        "dsn",
        "analytics_dev",
        "fct_postings",
        COLUMNS,
        ROWS,
        source="team_b.dev_mareh",
    )

    comment = connection.log[index_of(connection.log, "comment on table")]
    assert '"analytics_dev"."fct_postings"' in comment
    assert "from team_b.dev_mareh at " in comment


def test_the_stamp_lands_after_the_swap(connection):
    sync.publish("dsn", "analytics_dev", "fct_postings", COLUMNS, ROWS, source="team_b.dev_mareh")
    assert index_of(connection.log, "rename to") < index_of(connection.log, "comment on table")


def test_no_source_means_no_comment(connection):
    sync.publish("dsn", "analytics", "fct_postings", COLUMNS, ROWS)
    assert not any("comment on table" in statement for statement in connection.log)
