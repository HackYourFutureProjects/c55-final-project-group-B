with
    -- source as {{ ref("stg_postings") }},
    source as (select * from {{ ref("stg_postings") }}),

extract_contract as (
    select
        job_id,
        company_name,
        trim(title) as title,
        -- Extract contract type from title before cleaning it
        -- Example: "Parttime Chauffeur" -> "part_time"
        case
            when lower(title) rlike '\\b(parttime|part-time|bijbaan|deeltijd)\\b' then 'part_time'
            when lower(title) rlike '\\b(fulltime|full-time|voltijd)\\b' then 'full_time'
            else null
        end as contract_type_from_title
    from source
),

extract_employment_type as (
    select
        job_id,
        company_name,
        title,
        contract_type_from_title,
        -- Extract employment type from title before cleaning it
        -- Example: "Stageplek Sales & Events" -> "internship"
        case
            when lower(title) rlike '\\b(afstudeerstage|afstudeeropdracht)\\b' then 'graduation_internship'
            when lower(title) rlike '\\b(stage|stageplek|stageplaats|traineeship|trainee|werkervaringsplek|internship)\\b' then 'internship'
            else 'regular_job'
        end as employment_type
    from extract_contract
),

step1 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 1: Remove contract type words from title
        -- Example: "Restaurant Medewerker Fulltime" -> "Restaurant Medewerker"
        regexp_replace(
            title, 
            '(?i)\\b(fulltime|full-time|parttime|part-time|bijbaan|deeltijd|voltijd)\\b', 
            ''
        ) as title
    from extract_employment_type
),

step2 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 2: Remove "voor X dagdeel/dagdelen" and optional location after it
        -- Example: "Schoonmaak werk voor 1 dagdeel in Doetinchem" -> "Schoonmaak werk"
        regexp_replace(
            trim(title), 
            '(?i)\\s+voor\\s+\\d+\\s+dagde(?:el|len)(\\s+in\\s+[A-Z][a-zA-Zäöüéèëïí]+)?', ''
        ) as title
    from step1
),

step3 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 3: Standardize shift work format to "N-ploegen"
        -- Example: "Operator 5 Ploegendienst" or "Operator 5-PLOEGEN" -> "Operator 5-ploegen"
        regexp_replace(
            title,
            '(?i)(\\d+)[\\s-]*ploegen(dienst)?',
            '$1-ploegen'
        ) as title
    from step2
),

step4 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 4: Fix spacing around slashes
        -- Example: "Elektromonteur/Storingsmonteur" -> "Elektromonteur / Storingsmonteur"
        regexp_replace(title, '\\s*/\\s*', ' / ') as title
    from step3
),

step5 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 5: Remove text inside parentheses
        -- Example: "Data Engineer (Fulltime)" -> "Data Engineer"
        regexp_replace(title, '\\s*\\([^)]*\\)', '') as title
    from step4
),

step6 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 6: Remove special symbols and everything after them (*, ?, |, •)
        -- Example: "Python Developer | Remote" -> "Python Developer"
        regexp_replace(title, '\\s*[|•*?].*$', '') as title
    from step5
),

step7 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 7: Remove recruitment agency noise ("via Zorgwerk...")
        -- Example: "Verpleegkundige via Zorgwerk in Amsterdam" -> "Verpleegkundige"
        regexp_replace(title, '\\s+via\\s+Zorgwerk\\s+in.*$', '') as title
    from step6
),

step8 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 8: Remove city names or regions at the end of the title
        -- Example: "Developer - Amsterdam" or "Teamleader regio Venlo" -> "Developer" / "Teamleader"
        regexp_replace(
            title, 
            '\\s*([–-]|regio|in)\\s+[A-Z][a-zA-Zäöüéèëïí]+(\\s+en\\s+omgeving)?\\s*$', ''
        ) as title
    from step7
),

step9 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 9: Remove sentences after a period and clean trailing dashes
        -- Example: "Engineer. Full job description here..." -> "Engineer"
        regexp_replace(
            regexp_replace(title, '\\.\\s+[A-Z].*$', ''),
            '\\s*[–-]+\\s*$', ''
        ) as title
    from step8
),

step10 as (
    select
        job_id,
        company_name,
        contract_type_from_title,
        employment_type,
        -- Step 10: Remove leading internship/traineeship keywords and trailing colon
        -- Example: "Stageplek : Sales & Events bij KIT Amsterdam" -> "Sales & Events bij KIT Amsterdam"
        regexp_replace(
            title,
            '(?i)^\\s*(afstudeerstage|afstudeeropdracht|stageplek|stageplaats|stage|traineeship|trainee|werkervaringsplek|internship)\\s*:?\\s*',
            ''
        ) as title
    from step9
),

cleaned as (
    select
        job_id,
        contract_type_from_title,
        employment_type,
        -- Remove extra empty spaces and convert empty titles to NULL
        nullif(trim(title), '') as title,
        case
            when company_name is null then null
            else
                nullif(
                    trim(
                        regexp_replace(
                            regexp_replace(
                                company_name,
                                -- Clean legal company suffixes
                                -- Example: "Catawiki - B.V." -> "Catawiki"
                                '(?i)\\s*-\\s*(NL|B\\.?V\\.?|N\\.?V\\.?)\\s*$', ''
                            ),
                            -- Normalize multiple spaces into one single space
                            '\\s+', ' '
                        )
                    ),
                    ''
                )
        end as company_name
    from step10
)

select job_id, title, contract_type_from_title, employment_type, company_name
from cleaned
where title is not null
;