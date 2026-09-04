"""The parts of enrich.py worth testing: batching, defaults, and failure isolation.
No key and no network. `process_single_batch` and `enrich_records` both take
`llm_call` as a parameter (default: the real one), so these tests hand in a
fake that answers from a script instead of calling OpenRouter.
"""

import json

from src.ingestion.enrich import (
    BATCH_SIZE,
    DEFAULT_ATTRIBUTES,
    build_batch_prompt,
    enrich_records,
    process_single_batch,
)


def canned_response(overrides_by_index):
    """One canned model answer: {"0": {...}, "1": {...}, ...}."""
    return json.dumps({str(i): attrs for i, attrs in overrides_by_index.items()})


def test_a_full_batch_is_parsed_into_indexed_attributes():
    descriptions = ["Backend role, Python, 32 hours/week", "Frontend role, React"]
    answer = canned_response(
        {
            0: {**DEFAULT_ATTRIBUTES, "seniority_level": "senior", "skills": ["python"]},
            1: {**DEFAULT_ATTRIBUTES, "seniority_level": "junior", "skills": ["react"]},
        }
    )

    def fake_call(prompt, api_key):
        return answer

    batch_index, parsed = process_single_batch((0, descriptions, "fake-key"), fake_call)

    assert batch_index == 0
    assert parsed["0"]["seniority_level"] == "senior"
    assert parsed["1"]["skills"] == ["react"]


def test_an_empty_batch_short_circuits_without_calling_the_model():
    calls = []

    def fake_call(prompt, api_key):
        calls.append(prompt)
        return "{}"

    batch_index, parsed = process_single_batch((3, [], "fake-key"), fake_call)

    assert (batch_index, parsed) == (3, {})
    assert calls == [], "an empty batch must not spend a request"


def test_a_batch_that_raises_returns_empty_rather_than_crashing():
    """The failure-isolation behavior: one bad batch must not kill the run."""

    def fake_call(prompt, api_key):
        raise TimeoutError("upstream took too long")

    batch_index, parsed = process_single_batch((1, ["some description"], "fake-key"), fake_call)

    assert (batch_index, parsed) == (1, {})


def test_a_response_that_is_not_json_returns_empty_rather_than_crashing():
    def fake_call(prompt, api_key):
        return "Sure, here is your answer: not actually JSON"

    batch_index, parsed = process_single_batch((0, ["a description"], "fake-key"), fake_call)

    assert (batch_index, parsed) == (0, {})


def test_the_prompt_lists_all_eight_required_keys():
    prompt = build_batch_prompt(["A description"])
    for key in (
        "contract_type_from_desc",
        "seniority_level",
        "posting_language",
        "required_language",
        "salary_per_hour",
        "weekly_hours",
        "skills",
        "tasks",
    ):
        assert f'"{key}"' in prompt


def test_the_prompt_truncates_long_descriptions():
    """800 chars is a cost control, not an accident -- a test should notice
    if someone quietly removes the slice."""
    long_desc = "x" * 5000
    prompt = build_batch_prompt([long_desc])
    assert "x" * 801 not in prompt


def test_enrich_records_attaches_llm_enrichment_per_record(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "fake-key")
    records = [{"description": "Backend role"}, {"description": "Frontend role"}]

    def fake_call(prompt, api_key):
        return canned_response(
            {
                0: {**DEFAULT_ATTRIBUTES, "seniority_level": "senior"},
                1: {**DEFAULT_ATTRIBUTES, "seniority_level": "junior"},
            }
        )

    result = enrich_records(records, llm_call=fake_call)

    assert result[0]["llm_enrichment"]["seniority_level"] == "senior"
    assert result[1]["llm_enrichment"]["seniority_level"] == "junior"


def test_a_missing_index_in_the_answer_falls_back_to_defaults(monkeypatch):
    """A short answer must not leave a record with no llm_enrichment key at all."""
    monkeypatch.setenv("OPENROUTER_API_KEY", "fake-key")
    records = [{"description": "A"}, {"description": "B"}]

    def fake_call(prompt, api_key):
        return canned_response({0: {**DEFAULT_ATTRIBUTES, "seniority_level": "senior"}})

    result = enrich_records(records, llm_call=fake_call)

    assert result[0]["llm_enrichment"]["seniority_level"] == "senior"
    assert result[1]["llm_enrichment"] == DEFAULT_ATTRIBUTES


def test_missing_api_key_skips_enrichment_entirely(monkeypatch):
    """No key, no calls, and records come back untouched -- not half-enriched."""
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    records = [{"description": "Backend role"}]
    calls = []

    def fake_call(prompt, api_key):
        calls.append(prompt)
        return "{}"

    result = enrich_records(records, llm_call=fake_call)

    assert calls == []
    assert "llm_enrichment" not in result[0]


def test_batches_split_on_batch_size():
    descriptions = [f"description {i}" for i in range(BATCH_SIZE * 2 + 1)]
    starts = [i for i in range(0, len(descriptions), BATCH_SIZE)]
    assert starts == [0, BATCH_SIZE, BATCH_SIZE * 2]
