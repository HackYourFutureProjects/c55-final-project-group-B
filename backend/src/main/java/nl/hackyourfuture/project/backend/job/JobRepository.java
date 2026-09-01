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
            SELECT job_id,
                   title,
                   company_name,
                   location_city,
                   location_province,
                   description,
                   latitude,
                   longitude,
                   created,
                   redirect_url,
                   ingested_at
            FROM analytics.fct_postings
            ORDER BY created DESC
            """;

        List<JobSummaryDto> allJobs = jdbcClient.sql(sql)
                .query((resultSet, rowNumber) -> new JobSummaryDto(
                        resultSet.getString("job_id"),
                        resultSet.getString("title"),
                        resultSet.getString("company_name"),
                        resultSet.getString("location_city"),
                        resultSet.getString("location_province"),
                        resultSet.getString("description"),
                        resultSet.getObject("latitude", Double.class),
                        resultSet.getObject("longitude", Double.class),
                        resultSet.getString("created"),
                        resultSet.getString("redirect_url"),
                        resultSet.getString("ingested_at")
                ))
                .list();

        return allJobs.stream()
                .filter(job -> jobTitle == null || job.title().toLowerCase().contains(jobTitle.toLowerCase()))
                .filter(job -> city == null || job.locationCity().equalsIgnoreCase(city))
                .filter(job -> province == null || job.locationProvince().equalsIgnoreCase(province))
                .toList();
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
