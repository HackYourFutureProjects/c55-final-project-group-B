with
    staging as (select job_id, skills from {{ ref("stg_postings") }}),
    # Skills
    exploded as (
        select job_id, lower(trim(skill.element)) as skill_name
        from staging
        lateral view explode(from_json(skills, 'array<string>')) as skill
    )

select distinct job_id, skill_name
from exploded
where skill_name is not null and skill_name != ''
