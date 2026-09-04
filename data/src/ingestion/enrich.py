import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import litellm
from litellm import completion

litellm.num_retries = 3

logger = logging.getLogger("pipeline.enrich")


BATCH_SIZE = 5
MAX_WORKERS = 2
MODEL_NAME = "openrouter/openai/gpt-4o-mini"  # openrouter/openai/gpt-4o-mini


def build_batch_prompt(descriptions: list[str]) -> str:
    formatted_items = []
    for i, desc in enumerate(descriptions):
        clean_desc = (desc or "").strip()[:800]
        formatted_items.append(f"{i}. {clean_desc}")
    numbered = "\n\n".join(formatted_items)

    return (
        "Analyze the following job descriptions (which may be in Dutch or English) and extract key information for EACH one.\n\n"
        "Return ONLY a valid JSON object where each key is the description number (as a string),\n"
        "and each value is an object with these exact keys:\n"
        '1. "contract_type_from_desc": "full_time" | "part_time" | "unknown"\n'
        '2. "seniority_level": "junior" | "mid" | "senior" | "unknown"\n'
        '3. "posting_language": Language the text is written in (e.g. "Dutch", "English")\n'
        '4. "required_language": Primary language required for applicants (e.g. "Dutch", "English", "unknown")\n'
        '5. "salary_per_hour": Pure numeric float for hourly pay using dot decimal (e.g., 17.19 not "17,19"). Return null if not explicitly mentioned as an hourly rate.\n'
        '6. "weekly_hours": Extract weekly working hours range or estimate from terms like dagdelen (e.g., "16-19", "20", "8"). If multiple hour ranges exist, prefer the explicit hourly range (e.g. "16-19"). Return null if completely omitted.\n'
        '7. "skills": List of technical skills or tools mentioned. Translate Dutch skills to English. Return [] if none.\n'
        '8. "tasks": List of core job responsibilities or daily tasks. Translate Dutch tasks to English. Return [] if none.\n\n'
        f"Job Descriptions:\n{numbered}"
    )


def process_single_batch(batch_tuple):
    batch_index, batch_descriptions, api_key = batch_tuple
    if not batch_descriptions:
        return batch_index, {}

    prompt = build_batch_prompt(batch_descriptions)
    try:
        response = completion(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            response_format={"type": "json_object"},
            api_key=api_key,
            timeout=30,
        )
        raw_text = response.choices[0].message.content
        return batch_index, json.loads(raw_text)
    except Exception as e:  # pylint: disable=broad-except
        logger.error("LLM Batch %d failed: %s", batch_index, e)
        return batch_index, {}


def enrich_records(records: list[dict]) -> list[dict]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY is not set. Skipping LLM enrichment.")
        return records

    descriptions = [r.get("description", "") for r in records]
    batches = []

    for i in range(0, len(descriptions), BATCH_SIZE):
        batch = descriptions[i : i + BATCH_SIZE]
        batches.append((i, batch, api_key))

    enriched_results = {}

    logger.info("Processing %d batches concurrently with %d workers...", len(batches), MAX_WORKERS)
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_single_batch, b) for b in batches]
        for future in as_completed(futures):
            start_idx, batch_parsed = future.result()
            batch_desc_len = min(BATCH_SIZE, len(descriptions) - start_idx)

            for idx in range(batch_desc_len):
                global_index = start_idx + idx
                default_data = {
                    "contract_type_from_desc": "unknown",
                    "seniority_level": "unknown",
                    "posting_language": "Not Specified",
                    "required_language": "Not Specified",
                    "salary_per_hour": None,
                    "weekly_hours": None,
                    "skills": [],
                    "tasks": [],
                }
                res = batch_parsed.get(str(idx), default_data)
                enriched_results[global_index] = res

    for idx, record in enumerate(records):
        record["llm_enrichment"] = enriched_results.get(idx, {})

    return records
