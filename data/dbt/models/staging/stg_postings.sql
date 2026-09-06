with
    adzuna as (

        select
            concat('adzuna_', job_id) as job_id,
            job_id as original_job_id,
            'adzuna' as source_system,
            title,
            company_name,
            location_display_name,
            location_area,
            description,

            -- Contract & Seniority
            contract_type_from_desc,
            seniority_level,
            posting_language,
            required_language,

            -- Financials & Hours
            salary_min,
            salary_max,
            salary_per_hour,
            weekly_hours,
            null as salary_currency,  -- adzuna does not provide a currency field, so we set it to null
            null as salary_interval,  -- adzuna does not provide a salary interval field, so we set it to null

            -- Location Coordinates & Remote
            latitude,
            longitude,
            null as is_remote,  -- -adzuna does not provide a remote field, so we set it to null  

            -- Skills & Metadata
            skills,
            tasks,
            category_label,
            category_tag,
            null as source_site,  -- -adzuna does not provide a source site field, so we set it to null
            redirect_url,
            null as company_url,

            -- Audit
            created,
            ingest_date,
            ingested_at
        from {{ ref("stg_adzuna_postings") }}

    ),

    jobspy as (

        select
            concat('jobspy_', job_id) as job_id,
            job_id as original_job_id,
            'jobspy' as source_system,
            title,
            company_name,
            location_display_name,
            cast(null as array<string>) as location_area,  -- --jobspy does not provide a location area field, so we set it to null  
            description,

            -- Contract & Seniority
            contract_type_from_desc,
            seniority_level,
            posting_language,
            required_language,

            -- Financials & Hours
            salary_min,
            salary_max,
            salary_per_hour,
            weekly_hours,
            salary_currency,
            salary_interval,

            -- Location Coordinates & Remote
            null as latitude,  -- jobspy does not provide a latitude field, so we set it to null
            null as longitude,  -- jobspy does not provide a longitude field, so we set it to null
            is_remote,

            -- Skills & Metadata
            skills,
            tasks,
            null as category_label,  -- -jobspy does not provide a category label field, so we set it to null
            cast(null as string) as category_tag,  -- --jobspy does not provide a category tag field, so we set it to null
            source_site,
            redirect_url,
            company_url,

            -- Audit
            created,
            ingest_date,
            ingested_at
        from {{ ref("stg_jobspy_postings") }}

    ),

    combined_postings as (

        select *
        from adzuna
        union all
        select *
        from jobspy

    )

select *
from combined_postings
