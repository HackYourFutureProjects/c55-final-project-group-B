package nl.hackyourfuture.project.backend.savedjob;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SavedJobRepository {

    private final JdbcClient jdbcClient;

    public void saveJob(UUID userId, String jobId) {
        String sql = """
            INSERT INTO saved_jobs (user_id, job_id)
            VALUES (:userId, :jobId)
            ON CONFLICT (user_id, job_id) DO NOTHING
            """;
        jdbcClient.sql(sql)
                .param("userId", userId)
                .param("jobId", jobId)
                .update();
    }
}