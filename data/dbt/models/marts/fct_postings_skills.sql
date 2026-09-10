select job_id, skill_name, source_system, ingested_at
from {{ ref("int_postings_skills") }}
