package nl.hackyourfuture.project.backend.profile;

import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.profile.dto.UserProfileResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserProfileRepository {

    private final JdbcClient jdbcClient;

    public Optional<UserProfileResponse> findByUserId(UUID userId) {
        return jdbcClient.sql("""
                        SELECT preferred_city, preferred_province
                        FROM user_profiles
                        WHERE user_id = :userId
                        """)
                .param("userId", userId)
                .query((rs, rowNumber) -> new UserProfileResponse(
                        rs.getString("preferred_city"),
                        rs.getString("preferred_province")
                ))
                .optional();
    }

    public void save(
            UUID userId,
            String preferredCity,
            String preferredProvince
    ) {
        jdbcClient.sql("""
                        INSERT INTO user_profiles (
                            user_id,
                            preferred_city,
                            preferred_province
                        )
                        VALUES (
                            :userId,
                            :preferredCity,
                            :preferredProvince
                        )
                        ON CONFLICT (user_id)
                        DO UPDATE SET
                            preferred_city = EXCLUDED.preferred_city,
                            preferred_province = EXCLUDED.preferred_province
                        """)
                .param("userId", userId)
                .param("preferredCity", preferredCity)
                .param("preferredProvince", preferredProvince)
                .update();
    }
}