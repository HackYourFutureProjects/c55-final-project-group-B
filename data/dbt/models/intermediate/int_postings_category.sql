{#
  Title-matching WHEN clauses are generated from var("tech_roles") -- one
  list, defined once in dbt_project.yml, instead of duplicated by hand here
  and in a separate Python file. Adding a role means adding one line to the
  var, not remembering to update two places (which is how roles like
  "Scrum Master" and "Solution Architect" went missing before).
#}
with
    source as (select * from {{ ref("stg_postings") }}),

    cleaned_and_unified as (

        select
            job_id,
            title,
            source_system,

            -- 1. Cleaned Dutch category label (Adzuna only -- JobSpy never has one)
            case
                when category_label is null or trim(category_label) in ('', 'Unknown')
                then null
                when trim(category_label) = 'Vacatures Ander of Algemeen'
                then 'Algemeen'
                else trim(replace(category_label, ' vacatures', ''))
            end as category_label,

            -- 2. Unified English category tag
            case
                -- Adzuna's own tag, cleaned up, ONLY when it's not a generic
                -- catch-all bucket -- otherwise a specific title match below
                -- (e.g. "Data Engineer") is more useful than a vague source tag
                -- (e.g. "It").
                when
                    category_tag is not null
                    and trim(lower(category_tag))
                    not in ('', 'unknown', 'other-general-jobs', 'it-jobs')
                then
                    initcap(replace(replace(trim(category_tag), '-jobs', ''), '-', ' '))

                {% for role in var("tech_roles") -%}
                    when title ilike '%{{ role.match }}%' then '{{ role.tag }}'
                {% endfor -%}

                -- No match anywhere: NULL, not the raw title. A messy free-text
                -- "tag" that's really just the job title is worse than admitting
                -- we don't know -- it pollutes any group-by/filter downstream.
                else null
            end as category_tag,

            -- 3. Data quality flag: true only when we produced a REAL tag above,
            -- not just "the title wasn't null". Recomputed with the same rules
            -- as (2) rather than trusting a flag that could drift from it.
            case
                when
                    category_tag is not null
                    and trim(lower(category_tag))
                    not in ('', 'unknown', 'other-general-jobs', 'it-jobs')
                then true
                {% for role in var("tech_roles") -%}
                    when title ilike '%{{ role.match }}%' then true
                {% endfor -%}
                else false
            end as is_category_known

        from source

    )

select *
from cleaned_and_unified
