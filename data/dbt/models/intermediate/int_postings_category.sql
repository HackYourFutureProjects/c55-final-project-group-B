with
    source as (select * from team_b.dev_mareh.stg_postings),

    cleaned_categories as (
        select
            job_id,
            title,

            -- 1. Cleaned Dutch Category Label
            case
                when category_label is null or trim(category_label) in ('', 'Unknown')
                then null

                when trim(category_label) = 'Vacatures Ander of Algemeen'
                then 'Algemeen'

                else trim(replace(category_label, ' vacatures', ''))
            end as category_label,

            -- 2. Cleaned English Category Tag (e.g., 'hospitality-catering-jobs' ->
            -- 'Hospitality Catering')
            case
                when
                    category_tag is null or trim(lower(category_tag)) in ('', 'unknown')
                then null

                when trim(lower(category_tag)) = 'other-general-jobs'
                then 'General'

                else
                    initcap(replace(replace(trim(category_tag), '-jobs', ''), '-', ' '))
            end as category_tag,

            -- 3. Unified Data Quality Flag
            case
                when
                    (
                        category_label is null
                        or trim(category_label)
                        in ('', 'Unknown', 'Vacatures Ander of Algemeen')
                    )
                    and (
                        category_tag is null
                        or trim(lower(category_tag))
                        in ('', 'unknown', 'other-general-jobs')
                    )
                then false
                else true
            end as is_category_known

        from source
    )

select *
from cleaned_categories
;
