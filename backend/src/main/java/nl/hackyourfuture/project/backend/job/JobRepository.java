package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class JobRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<String> findAllJobTitles() {
        String sql = "SELECT DISTINCT title FROM analytics.fct_postings ORDER BY title";
        // Runs the SQL and returns each row's single column value converted to a String, collected into a List
        return jdbcTemplate.queryForList(sql, String.class);
    }

    public List<JobSummaryDto> findLatestJobs() {
        String sql = """
                SELECT posting_id,
                       title,
                       company_name,
                       location,
                       is_remote,
                       discipline,
                       posted_at
                FROM analytics.fct_postings
                ORDER BY posted_at DESC
                """;

        return jdbcTemplate.query(
                sql,
                (resultSet, rowNumber) -> new JobSummaryDto(
                        resultSet.getString("posting_id"),
                        resultSet.getString("title"),
                        resultSet.getString("company_name"),
                        resultSet.getString("location"),
                        resultSet.getBoolean("is_remote"),
                        resultSet.getString("discipline"),
                        resultSet.getObject("posted_at", OffsetDateTime.class)
                )
        );
    }
}
