
with source as (
    from {{ ref('stg_postings') }}
),

extracted_locations as (
    select
        job_id,
        location_area,
        
        -- Country is always index 0
        location_area[0] as raw_country,   
        -- Province is always the second element
        get(location_area, 1) as raw_province,
        -- City/Town is ALWAYS the last element in the hierarchy
        element_at(location_area, -1) as raw_city,
        -- Municipality is only present if the array has 4 elements
        case 
            when size(location_area) = 4 then get(location_area, 2)
            else null 
        end as raw_municipality
    from source
)

select
    job_id,
    location_area,
    
    coalesce(initcap(trim(raw_country)), 'Unknown') as country,
    
    coalesce(
       regexp_replace(
            initcap(trim(raw_province)),
            '-([a-z])',
            '-' || upper(regexp_extract(initcap(trim(raw_province)), '-([a-z])', 1))
        ),
        'Unknown'
    ) as province,
    
    coalesce(
        initcap(trim(regexp_replace(raw_city, '[^a-zA-Zà-ÿÀ-ß\\s-]', ''))), 
        'Unknown'
    ) as city,
    
    coalesce(initcap(trim(raw_municipality)), 'Unknown') as municipality

from extracted_locations