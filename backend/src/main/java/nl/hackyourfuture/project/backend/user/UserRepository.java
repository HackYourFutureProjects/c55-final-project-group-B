package nl.hackyourfuture.project.backend.user;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.auth.LoginUser;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepository {
    private final JdbcClient jdbcClient;

    public static final RowMapper<User> USER_ROW_MAPPER = (rs, _) -> User.builder()
            .id(rs.getObject("id", UUID.class))
            .name(rs.getString("name"))
            .email(rs.getString("email"))
            .build();

    public List<User> getAllUsers() {
        return jdbcClient
                .sql("SELECT id, name,  email FROM users ORDER BY name")
                .query(USER_ROW_MAPPER)
                .list();
    }

    public User createUser(User user) {
        jdbcClient
                .sql("INSERT INTO users (id, name, email) " +
                        "VALUES (:id, :name, :email)")
                .param("id", user.getId())
                .param("name", user.getName())
                .param("email", user.getEmail())
                .update();
        return user;
    }

    public Optional<User> createRegisteredUser(User user, String passwordHash) {
        return jdbcClient.sql("""
                        INSERT INTO users (id, name, email, password_hash)
                        VALUES (:id, :name, :email, :passwordHash)
                        ON CONFLICT (LOWER(BTRIM(email))) DO NOTHING
                        RETURNING id, name, email
                        """)
                .param("id", user.getId())
                .param("name", user.getName())
                .param("email", user.getEmail())
                .param("passwordHash", passwordHash)
                .query(USER_ROW_MAPPER)
                .optional();
    }

    public Optional<LoginUser> findLoginUserByEmail(String email) {
        return jdbcClient.sql("""
                        SELECT id, name, email, password_hash FROM users
                        WHERE LOWER(BTRIM(email)) = :email
                        """)
                .param("email", email)
                .query((rs, rowNumber) -> new LoginUser(
                        rs.getObject("id", UUID.class), rs.getString("name"),
                        rs.getString("email"), rs.getString("password_hash")))
                .optional();
    }

    public User updateUser(User user) {
        jdbcClient.sql("""
                        UPDATE users
                        SET name = :name,
                            email=:email,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id=:id
                        """)
                .param("id", user.getId())
                .param("name", user.getName())
                .param("email", user.getEmail())
                .update();
        return user;
    }
}
