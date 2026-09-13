package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import nl.hackyourfuture.project.backend.job.dto.RecommendedJobDto;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class JobRepository {

    private final JdbcClient jdbcClient;

    // Shared WHERE conditions for search/city/province filters.
    // Kept in one place so findJobs() and countJobs() always stay in sync.
    private static final String JOB_FILTER_CONDITIONS = """
        WHERE (:search::text IS NULL OR title ILIKE '%' || :search || '%' OR description ILIKE '%' || :search || '%'
              OR company_name ILIKE '%' || :search || '%' OR skills ILIKE '%' || :search || '%' )
          AND (:city::text IS NULL OR location_city ILIKE :city::text)
          AND (:province::text IS NULL OR location_province ILIKE :province::text)
        """;

    public List<JobSummaryDto> findJobs(String search,
                                        String city,
                                        String province,
                                        int page,
                                        int size) {

        String sql = """
        SELECT job_id, title, company_name, location_city, location_province,
               description, latitude, longitude, created, redirect_url, ingested_at,
               salary_min, salary_max, salary_display, salary_per_hour,
               employment_type, contract_type, seniority_level, posting_language,
               weekly_hours, skills, category_tag
        FROM analytics.fct_postings
        """ + JOB_FILTER_CONDITIONS + """
        ORDER BY created DESC
        LIMIT :size
        OFFSET :offset
        """;

        return jdbcClient.sql(sql)
                .param("search", search)
                .param("city", city)
                .param("province", province)
                .param("size", size)
                .param("offset", (long) page * size)
                .query((rs, rn) -> new JobSummaryDto(
                        rs.getString("job_id"),
                        rs.getString("title"),
                        rs.getString("company_name"),
                        rs.getString("location_city"),
                        rs.getString("location_province"),
                        rs.getString("description"),
                        rs.getObject("latitude", Double.class),
                        rs.getObject("longitude", Double.class),
                        rs.getString("created"),
                        rs.getString("redirect_url"),
                        rs.getString("ingested_at"),
                        rs.getBigDecimal("salary_min"),
                        rs.getBigDecimal("salary_max"),
                        rs.getString("salary_display"),
                        rs.getBigDecimal("salary_per_hour"),
                        rs.getString("employment_type"),
                        rs.getString("contract_type"),
                        rs.getString("seniority_level"),
                        rs.getString("posting_language"),
                        rs.getString("weekly_hours"),
                        rs.getArray("skills") == null
                                ? List.of()
                                : List.of((String[]) rs.getArray("skills").getArray()),
                        rs.getString("category_tag")
                ))
                .list();
    }
    public long countJobs(
            String search,
            String city,
            String province
    ) {
        String sql = "SELECT COUNT(*) FROM analytics.fct_postings " + JOB_FILTER_CONDITIONS;

        Long result = jdbcClient.sql(sql)
                .param("search", search)
                .param("city", city)
                .param("province", province)
                .query(Long.class)
                .single();

        return result == null ? 0 : result;
    }

    public List<RecommendedJobDto> findRecommendedJobs(
            List<String> userSkills,
            String preferredCity,
            String preferredProvince,
            int page,
            int size
    ) {
        String skills = String.join("\u001F", userSkills);
        String sql = """
                WITH user_skills AS (
                    SELECT DISTINCT LOWER(TRIM(skill)) AS skill
                    FROM unnest(string_to_array(CAST(:skills AS text), CHR(31))) AS skill
                    WHERE TRIM(skill) <> ''
                ), skill_matches AS (
                    SELECT posting_skill.job_id,
                           COUNT(DISTINCT user_skill.skill)::integer AS match_count,
                           ARRAY_AGG(DISTINCT user_skill.skill ORDER BY user_skill.skill) AS matched_skills
                    FROM analytics.fct_postings_skills posting_skill
                    JOIN user_skills user_skill
                      ON LOWER(TRIM(posting_skill.skill_name)) = user_skill.skill
                    GROUP BY posting_skill.job_id
                )
                SELECT posting.job_id, posting.title, posting.company_name,
                       posting.location_city, posting.location_province, posting.description,
                       posting.latitude, posting.longitude, posting.created, posting.redirect_url,
                       posting.ingested_at, posting.salary_min, posting.salary_max,
                       posting.salary_display, posting.salary_per_hour, posting.employment_type,
                       COALESCE(skill_match.match_count, 0) AS match_count,
                       COALESCE(skill_match.matched_skills, ARRAY[]::text[]) AS matched_skills
                FROM analytics.fct_postings posting
                LEFT JOIN skill_matches skill_match ON skill_match.job_id = posting.job_id
                ORDER BY COALESCE(skill_match.match_count, 0) DESC,
                         CASE WHEN NULLIF(:preferredCity, '') IS NOT NULL
                                   AND posting.location_city ILIKE :preferredCity THEN 1 ELSE 0 END DESC,
                         CASE WHEN NULLIF(:preferredProvince, '') IS NOT NULL
                                   AND posting.location_province ILIKE :preferredProvince THEN 1 ELSE 0 END DESC,
                         posting.created DESC
                LIMIT :size OFFSET :offset
                """;
        return jdbcClient.sql(sql)
                .param("skills", skills)
                .param("preferredCity", preferredCity == null ? "" : preferredCity)
                .param("preferredProvince", preferredProvince == null ? "" : preferredProvince)
                .param("size", size)
                .param("offset", (long) page * size)
                .query((rs, rowNumber) -> new RecommendedJobDto(
                        rs.getString("job_id"), rs.getString("title"), rs.getString("company_name"),
                        rs.getString("location_city"), rs.getString("location_province"),
                        rs.getString("description"), rs.getObject("latitude", Double.class),
                        rs.getObject("longitude", Double.class), rs.getString("created"),
                        rs.getString("redirect_url"), rs.getString("ingested_at"),
                        rs.getBigDecimal("salary_min"), rs.getBigDecimal("salary_max"),
                        rs.getString("salary_display"), rs.getBigDecimal("salary_per_hour"),
                        rs.getString("employment_type"), rs.getInt("match_count"),
                        List.of((String[]) rs.getArray("matched_skills").getArray())
                )).list();
    }

    public long countAllJobs() {
        Long result = jdbcClient.sql("SELECT COUNT(*) FROM analytics.fct_postings")
                .query(Long.class)
                .single();
        return result == null ? 0 : result;
    }


    public List<String> findAllJobTitles() {
        // INITCAP(title) converts the first letter of each word in the title to uppercase and the rest to lowercase.
        String sql = "SELECT DISTINCT INITCAP(title) title FROM analytics.fct_postings ORDER BY title";
        // Runs the SQL and returns each row's single column value converted to a String, collected into a List
        return jdbcClient.sql(sql)
                .query(String.class)
                .list();
    }

    public List<String> findAllDistinctCities(String province) {
        String sql = "SELECT DISTINCT INITCAP(location_city) location_city FROM analytics.fct_postings "
                + "WHERE (:province::text IS NULL OR location_province ILIKE :province::text) "
                + "ORDER BY location_city";
        return jdbcClient.sql(sql)
                .param("province", province)
                .query(String.class)
                .list();
    }

    public List<String> findAllDistinctProvinces() {
        String sql = "SELECT DISTINCT INITCAP(location_province) location_province FROM analytics.fct_postings ORDER BY location_province";
        return jdbcClient.sql(sql)
                .query(String.class)
                .list();
    }

    public boolean existsById(String jobId) {
        String sql = "SELECT EXISTS(SELECT 1 FROM analytics.fct_postings WHERE job_id = :jobId)";
        return Boolean.TRUE.equals(
                jdbcClient.sql(sql)
                        .param("jobId", jobId)
                        .query(Boolean.class)
                        .single()
        );
    }

}
