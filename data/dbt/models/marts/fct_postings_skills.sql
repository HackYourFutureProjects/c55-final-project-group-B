select job_id, skill_name from {{ ref("int_postings_skills") }}
