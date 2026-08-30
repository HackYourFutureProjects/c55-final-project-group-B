package nl.hackyourfuture.project.backend.savedjob;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.savedjob.dto.SavedJobResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
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


    public List<SavedJobResponse> findSavedJobsByUserId(UUID userId) {
        String sql = """
        SELECT fct_postings.job_id,
               fct_postings.title,
               fct_postings.company_name,
               fct_postings.location_city,
               fct_postings.location_province,
               fct_postings.description,
               fct_postings.latitude,
               fct_postings.longitude,
               fct_postings.created,
               fct_postings.redirect_url,
               fct_postings.ingested_at,
               saved_jobs.saved_at
        FROM saved_jobs
        JOIN analytics.fct_postings ON fct_postings.job_id = saved_jobs.job_id
        WHERE saved_jobs.user_id = :userId
        ORDER BY saved_jobs.saved_at DESC
        """;

        return jdbcClient.sql(sql)
                .param("userId", userId)
                .query((rs, rowNumber) -> new SavedJobResponse(
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
                        rs.getString("saved_at")
                ))
                .list();
    }
}