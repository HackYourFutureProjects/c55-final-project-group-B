with
    source as (select * from {{ ref("stg_postings") }}),

    extracted_locations as (
        select
            job_id,
            get(location_area, 1) as adzuna_province,
            element_at(location_area, -1) as adzuna_city,
            split(location_display_name, ',\\s*') as jobspy_parts
        from source
    ),

    normalized as (
        select
            job_id,

            regexp_replace(
                initcap(trim(adzuna_province)),
                '-([a-z])',
                '-'
                || upper(regexp_extract(initcap(trim(adzuna_province)), '-([a-z])', 1))
            ) as adzuna_province_clean,

            adzuna_city,

            case
                when size(jobspy_parts) = 3 then jobspy_parts[1] else null
            end as jobspy_province_raw,

            get(jobspy_parts, 0) as jobspy_city_raw
        from extracted_locations
    ),

    province_mapped as (
        select
            job_id,
            adzuna_city,
            jobspy_city_raw,
            coalesce(
                adzuna_province_clean,
                case
                    upper(trim(jobspy_province_raw))
                    when 'DR'
                    then 'Drenthe'
                    when 'DRENTHE'
                    then 'Drenthe'
                    when 'FL'
                    then 'Flevoland'
                    when 'FLEVOLAND'
                    then 'Flevoland'
                    when 'FR'
                    then 'Friesland'
                    when 'FRIESLAND'
                    then 'Friesland'
                    when 'FRYSLAN'
                    then 'Friesland'
                    when 'GE'
                    then 'Gelderland'
                    when 'GELDERLAND'
                    then 'Gelderland'
                    when 'GR'
                    then 'Groningen'
                    when 'GRONINGEN'
                    then 'Groningen'
                    when 'LI'
                    then 'Limburg'
                    when 'LIMBURG'
                    then 'Limburg'
                    when 'NB'
                    then 'Noord-Brabant'
                    when 'NOORD-BRABANT'
                    then 'Noord-Brabant'
                    when 'NOORD BRABANT'
                    then 'Noord-Brabant'
                    when 'NORTH BRABANT'
                    then 'Noord-Brabant'
                    when 'NH'
                    then 'Noord-Holland'
                    when 'NOORD-HOLLAND'
                    then 'Noord-Holland'
                    when 'NOORD HOLLAND'
                    then 'Noord-Holland'
                    when 'NORTH HOLLAND'
                    then 'Noord-Holland'
                    when 'OV'
                    then 'Overijssel'
                    when 'OVERIJSSEL'
                    then 'Overijssel'
                    when 'UT'
                    then 'Utrecht'
                    when 'UTRECHT'
                    then 'Utrecht'
                    when 'ZE'
                    then 'Zeeland'
                    when 'ZEELAND'
                    then 'Zeeland'
                    when 'ZH'
                    then 'Zuid-Holland'
                    when 'ZUID-HOLLAND'
                    then 'Zuid-Holland'
                    when 'ZUID HOLLAND'
                    then 'Zuid-Holland'
                    when 'SOUTH HOLLAND'
                    then 'Zuid-Holland'
                    else null
                end
            ) as raw_province
        from normalized
    ),

    city_checked as (
        select
            job_id,
            raw_province,
            coalesce(adzuna_city, jobspy_city_raw) as candidate_city
        from province_mapped
    )

select
    job_id,

    coalesce(nullif(trim(raw_province), ''), 'Unknown') as province,

    case
        when
            lower(trim(candidate_city)) in (
                'south holland',
                'north holland',
                'north brabant',
                'the randstad',
                'randstad',
                'the netherlands',
                'netherlands'
            )
        then 'Unknown'
        else
            coalesce(
                initcap(
                    trim(regexp_replace(candidate_city, '[^a-zA-Zà-ÿÀ-ß\\s-]', ''))
                ),
                'Unknown'
            )
    end as city

from city_checked
