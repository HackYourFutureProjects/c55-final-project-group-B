"""Validation models for JobSpy source data."""

from datetime import UTC, datetime
from typing import Any

import pandas as pd
from pydantic import BaseModel, ConfigDict, Field, field_validator


class JobSpyPosting(BaseModel):
    """One raw job posting record returned by JobSpy scraper."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    # Primary Attributes
    id: str
    title: str
    company: str | None = None
    company_url: str | None = None
    job_url: str
    description: str | None = None

    # Location & Remote
    location: str | dict | None = None
    is_remote: bool | None = False

    # Dates
    date_posted: datetime | str | None = None

    # Metadata & Job Details
    site: str | None = None
    job_type: str | None = None
    job_level: str | None = None
    company_industry: str | None = None
    emails: list[str] | str | None = Field(default_factory=list)

    # Salary fields
    min_amount: float | int | None = None
    max_amount: float | int | None = None
    currency: str | None = None
    interval: str | None = None

    # LLM Enrichment Object (مستخرج بشكل منفصل)
    llm_enrichment: dict[str, Any] | None = Field(default_factory=dict)

    @field_validator("*", mode="before")
    @classmethod
    def _sanitize_nan(cls, value: Any) -> Any:
        """Convert pandas NaN/NaT objects to None before validation."""
        if pd.isna(value):
            return None
        return value

    @field_validator("emails", mode="before")
    @classmethod
    def _parse_emails(cls, value: Any) -> list[str]:
        """Ensure emails are always returned as a clean list of strings."""
        if pd.isna(value) or value is None:
            return []
        if isinstance(value, str):
            return [e.strip() for e in value.split(",") if e.strip()]
        if isinstance(value, list):
            return [str(e).strip() for e in value if e]
        return []

    @field_validator("date_posted", mode="before")
    @classmethod
    def _parse_date(cls, value: Any) -> datetime | str | None:
        """Safely convert date types to datetime or standard string."""
        if pd.isna(value) or value is None:
            return None
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value, tz=UTC)
        if isinstance(value, pd.Timestamp):
            return value.to_pydatetime()
        return value
