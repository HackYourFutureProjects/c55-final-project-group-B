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

    ),

    deduplicated as (

        select *
        from renamed
        qualify row_number() over (partition by job_id order by ingested_at desc) = 1

    )

select *
from deduplicated
