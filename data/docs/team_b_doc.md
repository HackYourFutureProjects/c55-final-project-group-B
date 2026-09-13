# DATA TRACK DOC:

Data Engineers / [@hannah](https://github.com/hannahwn)
,[@mareh](https://github.com/mareh-aboghanem)

TECH LEAD / [@Lasse](https://github.com/lassebenni)

Our project is a job search website that helps John get a job!

So our role as DE is to help him by providing the data, cleaning it, and preparing it for him!

---

## Ingestion stage:

We started by fetching data from the Adzuna API, while our tech lead suggested that we use Jobspy. However, as beginners, we were not confident in using scraper tools initially.

* **Why Adzuna?**
We looked for data that covers only the 'Netherlands'. We designed the ingestion to be flexible, allowing country configuration during execution, and covered various job domains (not strictly tech jobs). We also looked for a free API and implemented pagination logic because Adzuna enforces a limit of 250 requests per month.

The data we get from Adzuna includes: `id`, `title`, `description`, `company name`, `redirected url`, `salary min`, `salary max`, `salary is predicted`, `created`, `location display name`, `location area`, `longitude`, and `latitude`.

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

The description from Adzuna was a short paragraph coupled with a link to the actual job posting. The frontend asked to extend the description, so we started to think about a new data source. Other than that, the BE and FE asked us for new columns that we did not get from Adzuna, so we tried using an LLM to extract them from descriptions. However, putting LLM calls inside initial ingestion was inefficient. We then integrated JobSpy as a second data source.

* **Why JobSpy?**
Jobspy served as a second data source to support Adzuna. It covers tech jobs specifically, so we targeted predefined tech roles (see [#tech-roles](https://www.google.com/search?q=%23tech-roles)). We selected the Netherlands (`NL`) as our target country and collected postings primarily from Indeed and LinkedIn.

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

**Ingestion Folder Structure:**

In this folder, we modularized the ingestion logic for each data source to ensure isolation—if JobSpy scraping fails, the Adzuna pipeline continues to run independently.

```text
ingestion/
├── ingest.py       # Source-specific fetchers
├── models.py       # Pydantic schema validations
├── pipeline.py     # Data extraction & orchestration entrypoints
├── storage.py      # Azure Blob storage writer utilities
├── __init__.py
└── main.py         # Entrypoint for ingestion execution

```

Initially, we had the LLM extraction running during the ingestion phase after trying to place it inside the models folder, which caused several errors. After debugging, Claude advised us to handle it there, but later our Tech Lead [@Lasse](https://github.com/lassebenni) pointed out that this approach wasn't optimal because the LLM extraction was not functioning as a proper incremental model. We later moved LLM processing to a Databricks serverless Python model inside dbt (`int_postings_extracted_attributes.py`).

---

### Columns Extracted via LLM

| # | Column | What it captures |
| --- | --- | --- |
| **1** | `contract_type_from_desc` | `full_time` / `part_time` / `unknown` |
| **2** | `seniority_level` | `junior` / `mid` / `senior` / `unknown` |
| **3** | `posting_language` | Language the posting itself is written in (e.g., "Dutch", "English") |
| **4** | `required_language` | Language required of applicants |
| **5** | `salary_per_hour` | Hourly rate as a plain float, if the posting states one |
| **6** | `weekly_hours` | Weekly working hours or a range (e.g., "16-19") |
| **7** | `skills` | List of tools/skills mentioned, translated to English |

> **Note:** If a batch fails, all records in that batch automatically fall back to `DEFAULT_ATTRIBUTES` (`unknown` / `null` / `[]`).

---

### TECH ROLES

```python
TECH_ROLES = [
    # Data & AI / ML
    "data engineer",
    "data analyst",
    "data scientist",
    "machine learning engineer",
    "analytics engineer",
    "ai engineer",
    "business intelligence developer",
    
    # Software Engineering & Development
    "software engineer",
    "backend developer",
    "frontend developer",
    "full stack developer",
    "python developer",
    "java developer",
    "mobile app developer",
    
    # Cloud, DevOps & Infrastructure
    "devops engineer",
    "cloud engineer",
    "cloud architect",
    "site reliability engineer",  # SRE
    "platform engineer",
    "systems administrator",
    
    # Cybersecurity & Networks
    "cyber security engineer",
    "security analyst",
    "network engineer",
    
    # Quality, Agile & Product Management
    "qa engineer",
    "test automation engineer",
    "scrum master",
    "product owner",
    "solution architect"
]

```

---

## DBT stage:

dbt has three main layers: **staging** is for loading source data and applying basic type casting, **intermediate** handles transformations focused on specific attributes, and **marts** forms the final consumption-ready structure of our data.

```text
       ┌─────────────────┐      ┌─────────────────┐
       │  Adzuna (API)   │      │ JobSpy (Scrape) │
       └────────┬────────┘      └────────┬────────┘
                │                        │
                ▼                        ▼
       ┌──────────────────────────────────────────┐
       │             STAGING MODELS               │
       │ stg_adzuna_postings | stg_jobspy_postings│
       └────────────────────┬─────────────────────┘
                            │
                            ▼
       ┌──────────────────────────────────────────┐
       │             stg_postings                 │
       └────────────────────┬─────────────────────┘
                            │
                            ▼
       ┌──────────────────────────────────────────┐
       │           INTERMEDIATE MODELS            │
       │ int_postings_title_company               │
       │ int_postings_locations                   │
       │ int_postings_salary                      │
       │ int_postings_extracted_attributes (LLM) │
       │ ... (skills, coordinates, contract_type) │
       └────────────────────┬─────────────────────┘
                            │
                            ▼
       ┌──────────────────────────────────────────┐
       │               MART MODELS                │
       │   fct_postings   │   fct_postings_skills │
       └──────────────────────────────────────────┘

```

### stg

* `stg_adzuna_postings`: Standardizes raw Adzuna fields, handles JSON structs, and performs initial type casts.
* `stg_jobspy_postings`: Cleans raw scraped output from JobSpy (Indeed & LinkedIn).
* `stg_postings`: Combines both sources into a unified staging layer via `UNION ALL`.

### intermediate

* `int_postings_title_company`: Cleans job titles, extracts company names, and applies fallbacks for empty titles.
* `int_postings_locations`: Normalizes Dutch cities, provinces, and location hierarchies.
* `int_postings_salary`: Standardizes hourly vs. annual rates into min/max salary fields.
* `int_postings_for_extractions`: Filters unstructured job descriptions ready for LLM processing.
* `int_postings_extracted_attributes`: Serverless Databricks PySpark script invoking LiteLLM to extract skills, seniority, and languages.
* `int_postings_coordinates`: Normalizes latitude and longitude spatial data.
* `int_postings_contract_type`: Standardizes contract types (`full_time`, `part_time`).
* `int_postings_category`: Maps job postings to industry categories.
* `int_postings_skills`: Flattens extracted skills array into tabular rows.

### marts

* `fct_postings`: Central Fact table containing consolidated job postings, enriched attributes, clean location hierarchies, and clean salaries.
* `fct_postings_skills`: Bridge/Fact table mapping `job_id` to individual standardized skill tags.

---

## AIRFLOW:

Airflow orchestrates our pipeline end-to-end via DAGs running on scheduled intervals:

1. **Ingestion Task:** Triggers `main.py` to pull data from Adzuna API & JobSpy scraper to Azure Blob Storage.
2. **dbt Run Task:** Executes `dbt run` across staging, intermediate, and mart models.
3. **LLM Serverless Task:** Runs `int_postings_extracted_attributes` incrementally on Databricks serverless compute.
4. **dbt Test Task:** Runs `dbt test` ensuring primary keys, foreign keys, and `not_null` constraints pass.

---

## STREAMLIT:

Streamlit serves as our interactive dashboard to monitor data freshness, pipeline health, and job analytics.

### Main Analytics & Health Checks:

* **Top Hiring Cities:** Which city has the most jobs?
* **Popular Job Titles:** Which job title has the most postings?
* **Top Hiring Companies:** Which company posts the most job openings?
* **Pipeline Health Monitoring:** Did Airflow DAGs run successfully, and is data up to date?
* **In-Demand Tech Skills:** Which skills are most frequently requested?
* **Category Breakdown:** Which category contains the highest volume of postings?
* **Salary Distribution:** Highest and lowest salary ranges across job categories.