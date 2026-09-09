import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from src.ingestion.litellm_client import DEFAULT_MODELS, completion_json, resolve_llm_config

logger = logging.getLogger("pipeline.enrich")

BATCH_SIZE = 15
MAX_WORKERS = 4

# Re-export for tests that patch model fallback order.
MODEL_CANDIDATES = DEFAULT_MODELS

DEFAULT_ATTRIBUTES = {
    "contract_type_from_desc": "unknown",
    "seniority_level": "unknown",
    "posting_language": "Not Specified",
    "required_language": "Not Specified",
    "salary_per_hour": None,
    "weekly_hours": None,
    "skills": [],
    "tasks": [],
}


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


def process_single_batch(
    batch_tuple,
    llm_call=completion_json,
    models=MODEL_CANDIDATES,
    api_base: str | None = None,
):
    batch_index, batch_descriptions, api_key = batch_tuple
    if not batch_descriptions:
        return batch_index, {}

    prompt = build_batch_prompt(batch_descriptions)

    for attempt_model in models:
        try:
            raw_text = llm_call(
                prompt,
                api_key,
                attempt_model,
                api_base=api_base,
            )

            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()

            parsed = json.loads(raw_text)

            validated_batch = {}
            if isinstance(parsed, dict):
                for idx, item in parsed.items():
                    full_item = DEFAULT_ATTRIBUTES.copy()
                    if isinstance(item, dict):
                        full_item.update(item)
                    validated_batch[str(idx)] = full_item

            if validated_batch:
                return batch_index, validated_batch

        except Exception as e:  # noqa: BLE001
            logger.warning("LLM Batch %d failed on model %s: %s", batch_index, attempt_model, e)

    return batch_index, {}


def calculate_and_log_metrics(records: list[dict]):
    total_records = len(records)
    if total_records == 0:
        logger.info("No records provided for metric calculation.")
        return

    successful_extractions = 0
    fallback_extractions = 0

    for record in records:
        enrichment = record.get("llm_enrichment", {})
        if (
            enrichment.get("skills")
            or enrichment.get("tasks")
            or enrichment.get("seniority_level") != "unknown"
            or enrichment.get("contract_type_from_desc") != "unknown"
        ):
            successful_extractions += 1
        else:
            fallback_extractions += 1

    success_rate = (successful_extractions / total_records) * 100

    logger.info("=== LLM Enrichment Summary Metrics ===")
    logger.info("Total Records Processed: %d", total_records)
    logger.info("Successfully Enriched: %d", successful_extractions)
    logger.info("Fallback (Defaults Used): %d", fallback_extractions)
    logger.info("Enrichment Success Rate: %.2f%%", success_rate)
    logger.info("=======================================")


def enrich_records(
    records: list[dict], llm_call=completion_json, models: list[str] | None = None
) -> list[dict]:
    config = resolve_llm_config()
    if not config:
        logger.error("No LiteLLM API key available. Skipping LLM enrichment.")
        for record in records:
            record["llm_enrichment"] = DEFAULT_ATTRIBUTES.copy()
        return records

    logger.info(
        "LiteLLM gateway configured (%s, models: %s)",
        config.api_base,
        ", ".join(config.models),
    )

    model_list = models or config.models
    descriptions = [r.get("description", "") for r in records]
    batches = []

    for i in range(0, len(descriptions), BATCH_SIZE):
        batch = descriptions[i : i + BATCH_SIZE]
        batches.append((i, batch, config.api_key))

    enriched_results = {}

    logger.info("Processing %d batches concurrently with %d workers...", len(batches), MAX_WORKERS)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [
            executor.submit(
                process_single_batch,
                batch,
                llm_call,
                model_list,
                config.api_base,
            )
            for batch in batches
        ]
        for future in as_completed(futures):
            try:
                start_idx, batch_parsed = future.result()
                batch_desc_len = min(BATCH_SIZE, len(descriptions) - start_idx)

                for idx in range(batch_desc_len):
                    global_index = start_idx + idx
                    res = batch_parsed.get(str(idx), DEFAULT_ATTRIBUTES)
                    enriched_results[global_index] = res
            except Exception as e:  # noqa: BLE001
                logger.error("Unexpected failure in batch execution worker: %s", e)

    for idx, record in enumerate(records):
        record["llm_enrichment"] = enriched_results.get(idx, DEFAULT_ATTRIBUTES)

    calculate_and_log_metrics(records)
    logger.info("LLM enrichment process completed safely for %d records.", len(records))
    return records
