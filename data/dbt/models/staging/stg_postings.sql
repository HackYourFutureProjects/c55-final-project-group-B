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
                    created string,
                    company struct<display_name: string>,
                    location struct<display_name: string, area: array<string>>,
                    category struct<label: string, tag: string>,
                    description string,
                    redirect_url string,
                    latitude double,
                    longitude double,
                    salary_min double,
                    salary_max double
                '
            )

    ),

    renamed as (

        select
            -- Standardize primary key
            cast(id as string) as job_id,
            
            -- Basic text cleaning
            trim(title) as title,
            
            -- Access nested structs
            coalesce(nullif(trim(company.display_name),'Unknown') as company_name,
            
            -- Access nested array items (Adzuna area array: [province, city])
            -- Use coalesce to provide a default value if the city or province is missing or empty
            coalesce(nullif(trim(location.area[1]), ''), 'Unknown') as location_city,
            coalesce(nullif(trim(location.area[0]), ''), 'Unknown') as location_province

            
            trim(description) as description,
            
            -- Numeric coordinates and salary values
            cast(latitude as double) as latitude,
            cast(longitude as double) as longitude,
            cast(salary_min as double) as salary_min,
            cast(salary_max as double) as salary_max,
            
            -- Timestamp conversion from ISO string
            to_timestamp(created) as created,
            
            -- Nested category metadata
            category.label as category_label,
            category.tag as category_tag,
            redirect_url,
            
            -- Lineage and file partition metadata
            source_file,
            ingest_date,
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