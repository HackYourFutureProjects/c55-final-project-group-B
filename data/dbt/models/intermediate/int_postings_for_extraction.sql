with
    source as (select * from {{ ref("stg_postings") }}),

    cleaned as (
        select
            job_id,
            description
        from source
        where nullif(trim(description), '') is not null
    )

select * from cleaned