package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
}