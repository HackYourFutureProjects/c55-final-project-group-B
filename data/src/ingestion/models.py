"""Validation models for the source data. Replace with your source's shape."""

from datetime import UTC, datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

# 1. Helper for nested 'company' object
class Company(BaseModel):
    display_name: str | None = None

# 2. Helper for nested 'location' object
class Location(BaseModel):
    display_name: str | None = None
    area: list[str] = Field(default_factory=list)

# 3. Helper for nested 'category' object
class Category(BaseModel):
    label: str | None = None
    tag: str | None = None

# 4. Main Posting Model matching Adzuna API items
class Posting(BaseModel):
    """One job posting record from the Adzuna API."""
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    # Required fields
    id: str
    title: str
    created: datetime
    # Optional nested objects
    company: Company = Field(default_factory=Company)
    location: Location = Field(default_factory=Location)
    category: Category = Field(default_factory=Category)
    # Optional scalar attributes
    description: str | None = None
    redirect_url: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    salary_is_predicted: str | None = None

    @field_validator("created", mode="before")
    @classmethod
    def _epoch_to_datetime(cls, value: object) -> object:
        """Unix timestamp to a UTC datetime.

        Without the timezone, Python reads the number in whatever zone the
        machine is in, so your laptop and the container disagree about what
        `posted_at` means.
        """
        if isinstance(value, int):
            return datetime.fromtimestamp(value, tz=UTC)
        return value

    model_config = {"populate_by_name": True}
