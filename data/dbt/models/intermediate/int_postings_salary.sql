with source as (
    from {{ ref('stg_postings') }}
),

cleaned as (
    select
        job_id,
        salary_is_predicted,
        cast(nullif(trim(salary_min), '') as numeric) as salary_min,
        cast(nullif(trim(salary_max), '') as numeric) as salary_max
    from source
),

transformed as (
    select
        job_id,
        salary_min,
        salary_max,
        salary_is_predicted,

        -- Does this posting have any salary info at all?
        case 
            when salary_min is null and salary_max is null then false 
            else true 
        end as has_salary_info,

        -- Midpoint: average if both bounds exist, otherwise whichever one exists
        case 
            when salary_min is not null and salary_max is not null 
                then (salary_min + salary_max) / 2
            else coalesce(salary_min, salary_max)
        end as salary_midpoint,

        -- Flag rows where a bound is implausibly low or high for an annual NL salary
        case 
            when salary_min is not null and salary_min < 5000 then true
            when salary_max is not null and salary_max < 5000 then true
            when salary_min is not null and salary_min > 300000 then true
            when salary_max is not null and salary_max > 300000 then true
            else false
        end as is_salary_outlier,

        -- Range width: how wide is the min-max spread (useful for spotting vague/broad postings)
        case 
            when salary_min is not null and salary_max is not null 
                then salary_max - salary_min
            else null
        end as salary_range_width,

        -- Optional: bucket into rough bands for easy grouping/reporting downstream
        case 
            when salary_min is null and salary_max is null then 'unknown'
            when coalesce(salary_max, salary_min) < 30000 then 'under_30k'
            when coalesce(salary_max, salary_min) between 30000 and 50000 then '30k_50k'
            when coalesce(salary_max, salary_min) between 50001 and 75000 then '50k_75k'
            when coalesce(salary_max, salary_min) between 75001 and 100000 then '75k_100k'
            else 'over_100k'
        end as salary_band,

        -- Human-readable salary string for display in search results
        case 
            when salary_min is null and salary_max is null then 'Salary not specified'
            when salary_min is not null and salary_max is not null and salary_min = salary_max 
                then concat('€', format_number(salary_min, 0))
            when salary_min is not null and salary_max is not null 
                then concat('€', format_number(salary_min, 0), ' - €', format_number(salary_max, 0))
            when salary_min is not null 
                then concat('From €', format_number(salary_min, 0))
            else concat('Up to €', format_number(salary_max, 0))
        end as salary_display,

-- Note reflecting trust/availability of the salary data
    case 
        when has_salary_info = false then 'not available'
        when is_salary_outlier = true then 'Unreliable value'
        when salary_is_predicted = true then 'Estimated'
        else 'Stated by employer'
    end as salary_note

    from cleaned
)

select * from transformed