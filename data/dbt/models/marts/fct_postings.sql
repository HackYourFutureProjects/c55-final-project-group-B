-- This mart is the contract with the backend team.
--
-- Its columns are what backend/ reads to build API endpoints, so treat a change
-- here the way you would treat changing a public API: agree it with the backend
-- trainees first, then change it in both places.
--
-- Airflow copies this table into the backend's database after dbt succeeds, so
-- whatever you select here is what they get.
--
-- Change: rename to your domain and decide the grain. Write one sentence in
-- _fct_postings.yml saying what one row means. If you cannot write that
-- sentence, the mart is not ready.
with
    postings as (select * from {{ ref("stg_postings") }}),

    job_title_company as (select * from {{ ref("int_postings_title_company") }}),
    locations as (select * from {{ ref("int_postings_locations") }}),
    salary as (select * from {{ ref("int_postings_salary") }}),
    category as (select * from {{ ref("int_postings_category") }}),
    geographic as (select * from {{ ref("int_postings_coordinates") }})

select
    -- Primary Keys & Core Details
    postings.job_id,
    job_title_company.title as title,
    job_title_company.company_name as company_name,
    postings.description as description,
    --Job_title_company.contract_type_from_title as contract_type_from_title,
    --job_title_company.employment_type as employment_type,

    -- Location Details
    locations.city as location_city,
    locations.province as location_province,
    geographic.latitude as latitude,
    geographic.longitude as longitude,

    -- Dates & URLs
    postings.created,
    postings.redirect_url,

    -- Category Attributes
    category.is_category_known,
    category.category_label,
    category.category_tag,

    -- Salary Attributes
    salary.salary_min,
    salary.salary_max,
    salary.salary_display,
    salary.salary_note,

    -- Audit Lineage
    postings.ingested_at

from postings
left join job_title_company on postings.job_id = job_title_company.job_id
left join locations on postings.job_id = locations.job_id
left join salary on postings.job_id = salary.job_id
left join category on postings.job_id = category.job_id
left join geographic on postings.job_id = geographic.job_id
