with
    staging as (select job_id, skills from {{ ref("int_postings_extracted_attributes") }}), 
    exploded as (
        select job_id, lower(trim(skill_element)) as skill_name
        from staging
        lateral view explode(skills) as skill_element
    )

select distinct job_id, skill_name
from exploded
where
    skill_name is not null and skill_name != '' and length(skill_name) between 2 and 35
