-- A posting dated in the future means the source changed its date format or
-- your parsing is wrong. Either way you want to know before the backend does.
select job_id, created 
from {{ ref("fct_postings") }}
where created > current_timestamp() + interval 1 day
