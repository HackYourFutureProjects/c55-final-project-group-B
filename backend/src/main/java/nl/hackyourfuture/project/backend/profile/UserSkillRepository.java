package nl.hackyourfuture.project.backend.profile;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserSkillRepository {

    private final JdbcClient jdbcClient;

    public List<String> findByUserId(UUID userId) {
        return jdbcClient.sql("""
                        SELECT skill_name
                        FROM user_profile_skills
                        WHERE user_id = :userId
                        ORDER BY skill_name
                        """)
                .param("userId", userId)
                .query(String.class)
                .list();
    }

    public void deleteByUserId(UUID userId) {
        jdbcClient.sql("""
                        DELETE FROM user_profile_skills
                        WHERE user_id = :userId
                        """)
                .param("userId", userId)
                .update();
    }

    public void saveAll(UUID userId, List<String> skills) {
        for (String skill : skills) {
            jdbcClient.sql("""
                            INSERT INTO user_profile_skills (user_id, skill_name)
                            VALUES (:userId, :skillName)
                            ON CONFLICT (user_id, skill_name) DO NOTHING
                            """)
                    .param("userId", userId)
                    .param("skillName", skill)
                    .update();
        }
    }
}
