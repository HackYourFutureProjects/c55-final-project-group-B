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
                    date_posted STRING
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
