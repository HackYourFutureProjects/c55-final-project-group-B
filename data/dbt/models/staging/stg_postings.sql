with
    source as (

        select
            *,
            _metadata.file_path as source_file,
            _metadata.file_modification_time as ingested_at
        from read_files('{{ var("landing_path") }}', format => 'json')

    ),

    renamed as (

        select
            cast(id as string) as job_id,
            trim(title) as title,
            nullif(trim(company.display_name), '') as company_name,
            coalesce(
                nullif(trim(location.display_name), ''), 'Unknown'
            ) as location_display_name,
            location.area as location_area,
            trim(description) as description,
            cast(
                llm_enrichment.contract_type_from_desc as string
            ) as contract_type_from_desc,
            cast(llm_enrichment.seniority_level as string) as seniority_level,
            cast(llm_enrichment.posting_language as string) as posting_language,
            cast(llm_enrichment.required_language as string) as required_language,
            try_cast(
                replace(
                    cast(llm_enrichment.salary_per_hour as string), ',', '.'
                ) as double
            ) as salary_per_hour,
            cast(llm_enrichment.weekly_hours as string) as weekly_hours,
            cast(llm_enrichment.skills as array<string>) as skills,
            cast(llm_enrichment.tasks as array<string>) as tasks,
            cast(latitude as double) as latitude,
            cast(longitude as double) as longitude,
            cast(salary_min as double) as salary_min,
            cast(salary_max as double) as salary_max,
            cast(salary_is_predicted as boolean) as salary_is_predicted,
            to_timestamp(created) as created,
            category.label as category_label,
            category.tag as category_tag,
            redirect_url,
            source_file,
            to_date(ingested_at) as ingest_date,
            ingested_at
        from source
        where id is not null and created is not null and redirect_url is not null

    ),

    deduplicated as (

        select *
        from renamed
        qualify row_number() over (partition by job_id order by ingested_at desc) = 1

    )

select *
from deduplicated
