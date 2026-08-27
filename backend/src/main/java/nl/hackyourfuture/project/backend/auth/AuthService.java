package nl.hackyourfuture.project.backend.auth;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.auth.dto.RegistrationRequest;
import nl.hackyourfuture.project.backend.user.User;
import nl.hackyourfuture.project.backend.user.UserRepository;
import nl.hackyourfuture.project.backend.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse register(RegistrationRequest request) {
        // BCrypt limits bytes, whereas the DTO's @Size measures characters.
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password cannot exceed 72 UTF-8 bytes");
        }

        var user = User.builder()
                .id(UUID.randomUUID())
                .name(request.name())
                .email(request.email())
                .build();
        return userRepository.createRegisteredUser(user, passwordEncoder.encode(request.password()))
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT, "Email is already registered"));
    }
}
