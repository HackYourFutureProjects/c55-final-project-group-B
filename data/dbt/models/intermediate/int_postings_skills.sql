with
    postings as (
        select job_id, source_system, ingested_at from {{ ref("stg_postings") }}
    ),

    staging as (select * from {{ ref("int_postings_extracted_attributes") }}),

    joined as (
        select
            postings.job_id,
            postings.source_system,
            postings.ingested_at,
            staging.skills
        from postings
        left join staging on postings.job_id = staging.job_id
    ),

    exploded as (
        select
            job_id, source_system, ingested_at, lower(trim(skill_element)) as skill_name
        from joined
        lateral view explode(skills) as skill_element
    )

select distinct job_id, source_system, skill_name, ingested_at
from exploded
where
    skill_name is not null and skill_name != '' and length(skill_name) between 2 and 35
