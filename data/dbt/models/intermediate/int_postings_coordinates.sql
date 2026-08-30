with source as (
    select * from {{ ref("stg_postings") }}
),

cleaned_coordinates as (
    select
        job_id,
        title,

        -- 1. Cleaned Latitude
        --    Nullify missing, null-island, out-of-range, and out-of-NL values
        case
            when latitude is null
            then null

            when latitude = 0 and longitude = 0
            then null  -- "null island" placeholder, not a real location

            when latitude < -90 or latitude > 90
            then null  -- impossible latitude, corrupted value

            when latitude not between 50.5 and 53.7
             or longitude not between 3.2 and 7.3
            then null  -- outside NL bounds; since all postings should be NL, this is a bad geocode

            else round(latitude, 6)
        end as latitude,

        -- 2. Cleaned Longitude
        case
            when longitude is null
            then null

            when latitude = 0 and longitude = 0
            then null

            when longitude < -180 or longitude > 180
            then null

            when latitude not between 50.5 and 53.7
             or longitude not between 3.2 and 7.3
            then null

            else round(longitude, 6)
        end as longitude,

        -- 3. Unified Geo Data Quality Flag
        case
            when latitude is null
              or longitude is null
              or (latitude = 0 and longitude = 0)
              or latitude < -90 or latitude > 90
              or longitude < -180 or longitude > 180
              or latitude not between 50.5 and 53.7
              or longitude not between 3.2 and 7.3
            then false
            else true
        end as is_geo_known

    from source
)

select * from cleaned_coordinates;