# data/dbt/models/intermediate/int_postings_extracted_attributes.py
#
# LLM extraction from job descriptions — runs on Databricks serverless.
# Prompt mirrors src/ingestion/enrich.py; ingest should land raw JSON only.
#
# dbt_project.yml:
#   models:
#     final_project:
#       intermediate:
#         int_postings_extracted_attributes:
#           +secret_scope: team_b
#           +llm_model: cheap
import json
import time
import urllib.error
import urllib.request
from collections.abc import Callable
from datetime import UTC, datetime

DEFAULT_ATTRIBUTES = {
    "contract_type_from_desc": "unknown",
    "seniority_level": "unknown",
    "posting_language": "Not Specified",
    "required_language": "Not Specified",
    "salary_per_hour": None,
    "weekly_hours": None,
    "skills": [],
}

ENDPOINT = (
    "https://app-litellm-team-d.blacksky-9263d113.westeurope.azurecontainerapps.io"
    "/v1/chat/completions"
)
MODEL = "medium"
BATCH_SIZE = 10
DESC_MAX_CHARS = 800
HTTP_TIMEOUT = 300
SECRET_KEY_NAME = "litellm-api-key"

OUTPUT_SCHEMA = (
    "job_id string, "
    "contract_type_from_desc string, "
    "seniority_level string, "
    "posting_language string, "
    "required_language string, "
    "salary_per_hour double, "
    "weekly_hours string, "
    "skills array<string> "
)


def build_batch_prompt(descriptions: list[str]) -> str:
    lines = []
    for index, description in enumerate(descriptions):
        clean = (description or "").strip()[:DESC_MAX_CHARS]
        lines.append(f"{index}. {clean}")
    numbered = "\n\n".join(lines)

    return (
        "Analyze the following job descriptions (which may be in Dutch or English) "
        "and extract key information for EACH one.\n\n"
        "Return ONLY a valid JSON object where each key is the description number "
        "(as a string),\n"
        "and each value is an object with these exact keys:\n"
        '1. "contract_type_from_desc": "full_time" | "part_time" | "unknown"\n'
        '2. "seniority_level": "junior" | "mid" | "senior" | "unknown"\n'
        '3. "posting_language": Language the text is written in (e.g. "Dutch", "English")\n'
        '4. "required_language": Primary language required for applicants '
        '(e.g. "Dutch", "English", "unknown")\n'
        '5. "salary_per_hour": Pure numeric float for hourly pay using dot decimal '
        '(e.g., 17.19 not "17,19"). Return null if not explicitly mentioned as an hourly rate.\n'
        '6. "weekly_hours": Extract weekly working hours range or estimate from terms '
        'like dagdelen (e.g., "16-19", "20", "8"). If multiple hour ranges exist, '
        'prefer the explicit hourly range (e.g. "16-19"). Return null if completely omitted.\n'
        '7. "skills": List of technical skills or tools mentioned. Translate Dutch skills '
        "to English. Return [] if none.\n"
        f"Job Descriptions:\n{numbered}"
    )


def _strip_json_fence(content: str) -> str:
    if "```json" in content:
        return content.split("```json")[1].split("```")[0].strip()
    if "```" in content:
        return content.split("```")[1].split("```")[0].strip()
    return content


def _parse_batch(content: str, count: int) -> list[dict]:
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"no JSON in the answer: {content[:120]!r}")

    parsed = json.loads(_strip_json_fence(content[start : end + 1]))
    rows: list[dict] = []

    for index in range(count):
        row = DEFAULT_ATTRIBUTES.copy()
        if isinstance(parsed, dict):
            raw = parsed.get(str(index), {})
            if isinstance(raw, dict):
                row.update(raw)
        rows.append(row)

    return rows


def chat(prompt: str, api_key: str, model: str) -> str:
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(
            {
                "model": model,
                "temperature": 0,
                "messages": [{"role": "user", "content": prompt}],
            }
        ).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=HTTP_TIMEOUT) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code == 429:
            raise RuntimeError(
                f"LiteLLM refused the request (429). Either the team's "
                f"$5/day budget is spent, or rpm/tpm limits were hit. "
                f"Gateway said: {error.read().decode()[:300]}"
            ) from error
        raise RuntimeError(f"LiteLLM returned {error.code}") from error

    return body["choices"][0]["message"]["content"]


def extract_batch(
    descriptions: list[str],
    api_key: str,
    model: str,
    *,
    call: Callable[[str, str, str], str] = chat,
) -> list[dict]:
    response = call(build_batch_prompt(descriptions), api_key, model)
    return _parse_batch(response, len(descriptions))


def extract_descriptions(
    descriptions: list[str],
    api_key: str,
    model: str,
    *,
    call: Callable[[str, str, str], str] = chat,
) -> list[dict]:
    results: list[dict] = []
    batch_starts = list(range(0, len(descriptions), BATCH_SIZE))

    for batch_index, start in enumerate(batch_starts):
        batch = descriptions[start : start + BATCH_SIZE]
        try:
            results.extend(extract_batch(batch, api_key, model, call=call))
        except RuntimeError as error:
            print(f"Stopping early after rate limit: {error}")
            break  # keep whatever succeeded, stop instead of crashing

        # Don't sleep after the very last batch — nothing more to wait for.
        if batch_index < len(batch_starts) - 1:
            time.sleep(10)
            print(f"Resumed after sleep at {datetime.now(UTC).isoformat()}")

    return results


def _as_float(value) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", "."))
    except ValueError:
        return None


def _as_string_list(value) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]


def _to_output_row(job_id: str, attrs: dict) -> tuple:
    return (
        job_id,
        str(attrs.get("contract_type_from_desc", "unknown")),
        str(attrs.get("seniority_level", "unknown")),
        str(attrs.get("posting_language", "Not Specified")),
        str(attrs.get("required_language", "Not Specified")),
        _as_float(attrs.get("salary_per_hour")),
        attrs.get("weekly_hours"),
        _as_string_list(attrs.get("skills")),
    )


def model(dbt, session):
    """One row per job_id with LLM-extracted description attributes."""
    dbt.config(
        materialized="incremental",
        unique_key="job_id",
        submission_method="serverless_cluster",
    )

    postings = dbt.ref("int_postings_for_extraction")

    if dbt.is_incremental:
        seen = session.table(f"{dbt.this}").select("job_id")
        postings = postings.join(seen, on="job_id", how="left_anti")

    collected = postings.select("job_id", "description").collect()
    if not collected:
        return session.createDataFrame([], OUTPUT_SCHEMA)

    scope = dbt.config.get("secret_scope")
    if not scope:
        raise RuntimeError(
            "secret_scope is not set. Add `secret_scope: team_b` under "
            "int_postings_extracted_attributes in dbt_project.yml."
        )

    api_key = dbutils.secrets.get(scope=scope, key=SECRET_KEY_NAME)  # noqa: F821
    model_name = dbt.config.get("llm_model") or MODEL

    job_ids = [row["job_id"] for row in collected]
    descriptions = [row["description"] for row in collected]
    extracted = extract_descriptions(descriptions, api_key, model_name)

    output_rows = [
        _to_output_row(job_ids[index], extracted[index]) for index in range(len(extracted))
    ]

    return session.createDataFrame(output_rows, OUTPUT_SCHEMA)
