with
    source as (

        select
            *,
            _metadata.file_path as source_file,
            _metadata.file_modification_time as ingested_at
        from
            read_files(
                '{{ var("landing_path") }}/jobspy/*/*',
                format => 'json',
                schemahints => '
                    id STRING,
                    site STRING,
                    title STRING,
                    company STRING,
                    company_url STRING,
                    job_url STRING,
                    location STRING,
                    is_remote BOOLEAN,
                    description STRING,
                    job_type STRING,
                    job_level STRING,
                    company_industry STRING,
                    emails ARRAY<STRING>,
                    min_amount DOUBLE,
                    max_amount DOUBLE,
                    currency STRING,
                    `interval` STRING,
                    date_posted STRING,
                    llm_enrichment STRING
                '
            )

    ),

    renamed as (

        select
            -- Primary Attributes
            cast(id as string) as job_id,
            trim(title) as title,
            nullif(trim(company), '') as company_name,
            company_url,
            job_url as redirect_url,
            trim(description) as description,

            -- Location & Remote
            coalesce(nullif(trim(location), ''), 'Unknown') as location_display_name,
            cast(is_remote as boolean) as is_remote,

            -- Metadata & Job Details
            site as source_site,
            job_type,
            job_level,
            company_industry,
            emails,

            -- Financials
            cast(min_amount as double) as salary_min,
            cast(max_amount as double) as salary_max,
            currency as salary_currency,
            interval as salary_interval,

            -- LLM Enrichment Fields
            -- llm_enrichment is read as a raw JSON string (not STRUCT) because
            -- at least one legacy landed file (ingest_date=2026-09-05) has a
            -- malformed shape from a run predating the enrich.py fallback fix:
            -- the whole per-batch response got stored under a stray numeric
            -- key (e.g. {"1": {...}}) instead of being unpacked per record.
            -- get_json_object degrades gracefully to NULL on that shape
            -- instead of failing the whole read the way a STRUCT schema hint
            -- did. New files (post-fix) parse normally.
            get_json_object(
                llm_enrichment, '$.contract_type_from_desc'
            ) as contract_type_from_desc,
            get_json_object(llm_enrichment, '$.seniority_level') as seniority_level,
            get_json_object(llm_enrichment, '$.posting_language') as posting_language,
            get_json_object(llm_enrichment, '$.required_language') as required_language,
            try_cast(
                replace(
                    get_json_object(llm_enrichment, '$.salary_per_hour'), ',', '.'
                ) as double
            ) as salary_per_hour,
            get_json_object(llm_enrichment, '$.weekly_hours') as weekly_hours,
            from_json(
                get_json_object(llm_enrichment, '$.skills'), 'array<string>'
            ) as skills,
            from_json(
                get_json_object(llm_enrichment, '$.tasks'), 'array<string>'
            ) as tasks,

            -- Dates & Audit Metadata
            to_timestamp(date_posted) as created,
            source_file,
            to_date(ingested_at) as ingest_date,
            ingested_at

        from source
        where id is not null and date_posted is not null and job_url is not null

    ),

    deduplicated as (

        select *
        from renamed
        qualify row_number() over (partition by job_id order by ingested_at desc) = 1

    )

select *
from deduplicated
