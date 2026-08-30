with cleaned_locations as (
    select * from {{ ref('int_postings_locations') }}
)

select distinct
    md5(concat_ws('||', coalesce(country, ''), coalesce(province, ''), coalesce(city, ''), coalesce(municipality, ''))) as location_key,
    country,
    province,
    city,
    municipality
from cleaned_locations;