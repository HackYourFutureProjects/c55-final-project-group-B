--We need to clean again the title later


with source as (

    select * from {{ ref('stg_postings') }}

),

cleaned as (
    select
        -- Clean title: strip parentheticals, pipes, bullets, "via Zorgwerk...", trailing dash+location, sentence tails
        nullif(
            trim(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(
                                        regexp_replace(trim(title), '\\s+', ' '),
                                        '\\s*\\([^)]*\\)\\s*$', ''
                                    ),
                                    '\\s*\\|.*$', ''
                                ),
                                '\\s*•.*$', ''
                            ),
                            '\\s+via\\s+Zorgwerk\\s+in.*$', ''
                        ),
                        '\\s*[–-]\\s*[A-Z][a-zA-Zäöüéèëïí]+(\\s+en\\s+omgeving)?\\s*$', ''
                    ),
                    '\\.\\s+[A-Z].*$', ''
                )
            ),
            ''
        ) as title,

        -- Clean company_name: strip trailing legal suffixes (NL, B.V., N.V.), normalize whitespace
        case
            when company_name is null then null
            else
                nullif(
                    trim(
                        regexp_replace(
                            regexp_replace(
                                company_name,
                                '(?i)\\s*-\\s*(NL|B\\.?V\\.?|N\\.?V\\.?)\\s*$',
                                ''
                            ),
                            '\\s+', ' '
                        )
                    ),
                    ''
                )
        end as company_name

    from source
)

select title, company_name
from cleaned
where title is not null;