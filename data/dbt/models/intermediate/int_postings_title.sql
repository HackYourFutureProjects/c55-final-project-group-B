--ask Marah about trimming company NAMES with regex,do we to completely drop or just trim?


with source as (

    select * from {{ ref('stg_postings') }}

),

cleaned as (

    select
        * except (title, company_name),

        nullif(regexp_replace(trim(title), '\\s+', ' '), '') as title_cleaned,

        case
            when company_name is null then null
            else
                trim(
                    regexp_replace(
                        regexp_replace(
                            company_name,
                            '(?i)\\s*-\\s*(NL|B\\.?V\\.?|N\\.?V\\.?)\\s*$',
                            ''
                        ),
                        '\\s+', ' '
                    )
                )
        end as company_name_cleaned

    from source

)

select *
from cleaned
where title_cleaned is not null