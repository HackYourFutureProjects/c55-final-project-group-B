# DATA TRACK DOC:
Data Engineers / @hannah(githup url,linkedin) , @mareh(githup url,linkedin)
TECH LEAD / @Lasse(url)

Our project is job search website that help john to get a job!
So our role as DE is to help him by provideing the data and to clean it and to perpare it for him!

## Ingestion stage:

We start by fetching data from Adzuna API while our tech lead suggested to us to use Jobspy but we were not confident in using scarpper tools as beginners.

* **Why?**

We looked for data that covers only 'Netherlands' i.e we did the ingestion in a flexible allowing changing of countries during ingestion and covered different types of jobs not only tech jobs. We also looked for an API that was free and we added the pagination logic because Adzuna offers a 250 requests per month. 

The data we get from Adzuna has id,title,description, company name, redirected url, salary min, salary max, salary is predicted, created,location display name, location area, logitude and latitude

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

The description from Adzuna was a short paragraph coupled with a link to the actual job posting. The frontend asked to extend the description so we started to think about a new data source. Other than that BE and FE aske us for new columns that we did not get from Azuna so we tried llm to extract them from descriptions but the results we not satisfying. We went to jobspy as a second source of data.

* **Why?**

Jobspy as a second data source to support adzuna

Jobspy covers tech jobs and we selected some tech roles (tech-roles-url). We selected Nl as a country and we collected from indeed and linkedin specifically. 

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


Ingestion Folder: You will find in this folder we duplicate the logic of ingestion process for each data source.The reason is because we added Jobspy later and wanted to make sure incase it fails we still have Adzuna ingestion process working.

-ingest.py: 
-models.py
-pipeline.py
-storage.py
-__init__.py
-main.py

Initialy we had the llm extraction in the ingestion process after we tried to put it inside the models folder and had alot of errors . After debugging this error, Claude advised that we put it there and later we discovered through our tech leader that it was not a good approach because the llm model didn't work as incremental model. 



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


> **Note:** If a batch fails all records in that batch automatically fall back to `DEFAULT_ATTRIBUTES` (`unknown` &#47; `null` &#47; `[]`). 


#TECH_ROLES = [
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
# DBT stage:

DBT has three levels : staging is for fetching data and we can add simple logic, intermediate is for transformations focused on specific colunms and mart is the last shape of our data.

## stg

stg_adzuna_postings
stg_jobspy_postings
stg_postings

## intermadite

int_postings_title_company
int_postings_locations
int_postings_salary
int_postings_for_extractions
int_postings_extracted_attributes
int_postings_coordinates
int_postings_contract_type
int_postings_category
int_postings_skills

## marts

fct_postings
fct_postings_skills


# AIRFLOW:

TRAUMA IDENTIFIED

# STREAMLITE:

This is the dashboard to do heath checks and freshness of our data.

This queries the data :
which city has the most job?
which job has most postings?
which company has most jobs?
How is airflow,did dags run succesfully,?
which skills were most posted?
which category has most jobs?
highest salary,min salary?


- flowchart 

- tabel : col 
