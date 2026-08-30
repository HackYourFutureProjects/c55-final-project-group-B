-- tests/assert_unique_posting_locations.sql
--
-- Singular test: Returns any job_id and location pairs that appear more than once.
-- If this query returns 0 rows, the test PASSES.
-- If it returns 1 or more rows, the test FAILS.

select 
    job_id, 
    city, 
    province, 
    count(*) as rows_found
from {{ ref("int_postings_locations") }}
group by 
    job_id, 
    city, 
    province
having count(*) > 1