with
    staging as (select job_id, tasks from {{ ref("stg_postings") }}),

    exploded as (
        select job_id, lower(trim(task_element)) as task_name
        from staging
        lateral view explode(tasks) as task_element
    )

select distinct job_id, task_name
from exploded
where task_name is not null and task_name != ''
