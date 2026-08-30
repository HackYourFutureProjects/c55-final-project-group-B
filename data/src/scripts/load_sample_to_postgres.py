import json
import os
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

# 1. Load environment variables from root .env file
load_dotenv()

DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB")

# Check that credentials are loaded
if not all([DB_USER, DB_PASS, DB_HOST, DB_NAME]):
    raise ValueError(
        "Missing database credentials in .env file! "
        "Ensure POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, and POSTGRES_DB are set."
    )

# 2. Path to sample JSON file relative to this script
JSON_PATH = Path(__file__).parent / "adzune_sample_data_example.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# 3. Extract and flatten records to match your mart contract schema
flattened_rows = []
for job in raw_data.get("results", []):
    flattened_rows.append(
        {
            "job_id": job.get("id"),
            "title": job.get("title"),
            "company_name": job.get("company", {}).get("display_name"),
            "location_city": job.get("location", {}).get("display_name"),
            "location_province": job.get("location", {}).get("area", [None, None])[-1],
            "description": job.get("description"),
            "latitude": job.get("latitude"),
            "longitude": job.get("longitude"),
            "created": job.get("created"),
            "redirect_url": job.get("redirect_url"),
            "category_label": job.get("category", {}).get("label"),
            "category_tag": job.get("category", {}).get("tag"),
            "ingested_at": datetime.now(UTC).isoformat(),
        }
    )

df = pd.DataFrame(flattened_rows)

# 4. Push to Postgres
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

df.to_sql(
    name="fct_postings",
    con=engine,
    schema="analytics",
    if_exists="replace",
    index=False,
)

print("Populated Postgres with contract-compliant sample data!")
