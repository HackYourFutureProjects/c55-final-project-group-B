with
title_company as (select * from {{ ref("int_postings_title_company") }}),

extracted as (select * from {{ ref("int_postings_extracted_attributes") }}),

joined as (
  select
    title_company.job_id,
    title_company.contract_type_from_title,
    extracted.contract_type_from_desc
  from title_company
  left join extracted on title_company.job_id = extracted.job_id
),

cleaned_contract as (
  select
    job_id,
    contract_type_from_title,
    contract_type_from_desc,
    case
      when contract_type_from_title in ('full_time', 'part_time')
        then contract_type_from_title
      when contract_type_from_desc in ('full_time', 'part_time')
        then contract_type_from_desc
      else 'unknown'
    end as contract_type
  from joined
)

select *
from cleaned_contract
