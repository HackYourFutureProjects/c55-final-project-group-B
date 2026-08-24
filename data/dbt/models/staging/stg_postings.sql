with
    source as (

        select
            *,
            _metadata.file_path as source_file,
            _metadata.file_modification_time as ingested_at
        from
            read_files(
                '{{ var("landing_path") }}',
                format => 'json',
                schemahints => '
                    id string,
                    title string,
                    description string,
                    created string,
                    redirect_url string,
                    latitude double,
                    longitude double,
                    salary_min double,
                    salary_max double,
                    company struct<display_name: string>,
                    location struct<display_name: string, area: array<string>>,
                    category struct<label: string, tag: string>
                '
            )

    ),

    renamed as (

        select
            cast(id as string) as job_id,
            trim(title) as title,

            -- Safe nested lookup for company and area array
            
            nullif(trim(company.display_name), '') as company_name,
            coalesce(nullif(trim(location.display_name), ''), 'Unknown') as location_display_name,
            location.area as location_area,

            trim(description) as description,
            cast(latitude as double) as latitude,
            cast(longitude as double) as longitude,
            cast(salary_min as double) as salary_min,
            cast(salary_max as double) as salary_max,

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
        qualify
            row_number() over (partition by job_id order by ingested_at desc) = 1

    )

select *
from deduplicated