package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class JobRepository {

    private final JdbcClient jdbcClient;

    public List<JobSummaryDto> findJobs(String jobTitle, String city, String province) {

        String sql = """
            SELECT job_id, title, company_name, location_city, location_province,
                   description, latitude, longitude, created, redirect_url, ingested_at
            FROM analytics.fct_postings
            WHERE (:jobTitle::text IS NULL OR title ILIKE '%' || :jobTitle || '%')
              AND (:city::text IS NULL OR location_city ILIKE :city)
              AND (:province::text IS NULL OR location_province ILIKE :province)
            ORDER BY created DESC
        """;

        return jdbcClient.sql(sql)
                .param("jobTitle", jobTitle)
                .param("city", city)
                .param("province", province)
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
                        rs.getString("ingested_at")
                ))
                .list();
    }

    public List<String> findAllJobTitles() {
        // INITCAP(title) converts the first letter of each word in the title to uppercase and the rest to lowercase.
        String sql = "SELECT DISTINCT INITCAP(title) title FROM analytics.fct_postings ORDER BY title";
        // Runs the SQL and returns each row's single column value converted to a String, collected into a List
        return jdbcClient.sql(sql)
                .query(String.class)
                .list();
    }

    public List<String> findAllDistinctCities() {
        String sql = "SELECT DISTINCT INITCAP(location_city) location_city FROM analytics.fct_postings ORDER BY location_city";
        return jdbcClient.sql(sql)
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
