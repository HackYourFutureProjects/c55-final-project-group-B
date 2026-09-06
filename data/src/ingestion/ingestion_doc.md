---

# Ingestion Sources & LLM Extraction Documentation

---

## Data Source

### 1. Adzuna API

* **Why?**
Adzuna provides strong coverage of the Dutch job market (NL) and offers an official API with a free tier of 250 requests per month for students and developers. It was chosen for its straightforward integration and quick access to API credentials compared to larger platforms.
* **Advantages:**
* Highly stable API responses that yield 100% structured data.
* Provides out-of-the-box fields for salary ranges and regional location hierarchies.


* **Disadvantages:**
* The free tier is capped at 250 requests per month, requiring careful request management during development.
* Geographic and category metadata occasionally expose internal class names from the underlying backend language (Ruby).



#### How `data.json` looks (per record, top-level fields):

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string / number` | Adzuna's posting id — cast to `job_id` downstream |
| `title` | `string` | Job title |
| `description` | `string` | Full job description text (source for LLM enrichment) |
| `redirect_url` | `string` | Link to the original posting |
| `created` | `timestamp string` | Date and time the job was published |
| `latitude` / `longitude` | `float` | Geolocation coordinates |
| `salary_min` / `salary_max` | `float` | Salary bounds if specified |
| `salary_is_predicted` | `boolean` | Whether Adzuna estimated the salary vs. it being stated |
| `location` | `struct` | `{__CLASS__, display_name, area: [country, province, ..., city]}` — `area` is a hierarchy array, most specific last |
| `company` | `struct` | `{__CLASS__, display_name}` |
| `category` | `struct` | `{__CLASS__, label, tag}` — `label` in Dutch, `tag` in English |

> **Note:** The `__CLASS__` attribute inside `location`, `company`, and `category` structs is Adzuna's internal Ruby class name (e.g., `Adzuna::API::Response::Location`) leaking through into the JSON response — it is not added by our pipeline.

---
#How to run : uv run python -m src.ingestion.adzuna.pipeline

### 2. JobSpy

JobSpy is a separate data source from Adzuna with its own dedicated pipeline path, not a wrapper around the Adzuna API.

* **Why?**
The `JobSpy` Python library was integrated to scrape job postings directly from platforms like LinkedIn, Indeed, and Glassdoor without needing to build custom web scrapers or handle site-specific authentication mechanisms.
* **Advantages:**
* Multi-board scraping using a single execution function (`scrape_jobs`).
* Captures supplementary attributes not always provided by standard APIs (e.g., `is_remote`, direct apply links, and work type).


* **Disadvantages:**
* Relying on scraping makes it susceptible to rate limiting and HTML structure changes on target sites.
* Takes longer to execute compared to direct REST API calls.



#### How `data.json` looks (top-level fields from JobSpy):

```json
{
  "id": "ind_12345678",
  "site": "indeed",
  "job_url": "https://www.indeed.com/viewjob?jk=12345678",
  "title": "Data Engineer",
  "company": "Tech Corp",
  "location": "Amsterdam, North Holland, Netherlands",
  "date_posted": "2026-08-30",
  "job_type": "fulltime",
  "salary_source": "direct_data",
  "interval": "yearly",
  "min_amount": 55000.0,
  "max_amount": 70000.0,
  "currency": "EUR",
  "is_remote": false,
  "description": "Full job description text in Dutch/English..."
}

```
#How to run : uv run python -m src.ingestion.jobspy.pipeline
---

## Extract from Description Using LLM

### Why LiteLLM

LiteLLM provides a single, consistent `completion()` interface (OpenAI-compatible across providers), so switching models or providers is a simple configuration change rather than a code rewrite. It also automatically handles transient network glitches by retrying failed requests (`litellm.num_retries = 3`), ensuring a single network drop doesn't crash a batch.

### OpenRouter

OpenRouter sits behind LiteLLM as a proxy provider. It grants access to various models (including several free-tier options) through a single API key, eliminating the need to manage separate accounts and keys across multiple AI vendors.

### Which Models, and Why Fallback

```python
MODEL_CANDIDATES = [
    "openrouter/z-ai/glm-5.2:free",
    "openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
]

```

Two free candidate models are tried sequentially instead of relying on a single option:

* **Not `openrouter/auto`:** It can automatically route requests to paid models if it deems the prompt complex, risking unexpected costs.
* **Not `openrouter/free`:** It randomly rotates requests across all available free models, leading to inconsistent extraction quality across batches. Fixed candidates were chosen to maintain stable extraction schemas.
* **Why Fallback:** Shared free-tier models frequently encounter rate limits (429 errors) during peak usage. If the primary model fails due to a rate limit, timeout, malformed JSON, or an empty response, the pipeline falls back to the second model before applying default values.
* **`reasoning: {"enabled": False}`:** Both candidate models support internal chain-of-thought reasoning. Since this is a structured schema extraction task rather than open-ended reasoning, reasoning is disabled to save token overhead and reduce latency.
* **`provider: {"allow_fallbacks": False}`:** Prevents OpenRouter from silently switching to a paid provider for the same model if the free provider endpoint is unavailable.

---

### Columns Extracted

| # | Column | What it captures |
| --- | --- | --- |
| **1** | `contract_type_from_desc` | `full_time` / `part_time` / `unknown` |
| **2** | `seniority_level` | `junior` / `mid` / `senior` / `unknown` |
| **3** | `posting_language` | Language the posting itself is written in (e.g., "Dutch", "English") |
| **4** | `required_language` | Language required of applicants |
| **5** | `salary_per_hour` | Hourly rate as a plain float, if the posting states one |
| **6** | `weekly_hours` | Weekly working hours or a range (e.g., "16-19") |
| **7** | `skills` | List of tools/skills mentioned, translated to English |
| **8** | `tasks` | List of core responsibilities, translated to English |

> **Note:** If a batch fails across all candidate models, all records in that batch automatically fall back to `DEFAULT_ATTRIBUTES` (`unknown` / `null` / `[]`) to ensure the entire ingestion run completes without throwing fatal errors.




