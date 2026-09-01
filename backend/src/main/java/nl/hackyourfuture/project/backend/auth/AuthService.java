package nl.hackyourfuture.project.backend.auth;

import nl.hackyourfuture.project.backend.auth.dto.LoginRequest;
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
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    public LoginUser login(LoginRequest request) {
        var candidate = userRepository.findLoginUserByEmail(request.email());
        String hash = candidate.map(LoginUser::passwordHash).orElse(dummyHash);
        boolean supportedLength = request.password().getBytes(StandardCharsets.UTF_8).length <= 72;
        boolean matches = passwordEncoder.matches(supportedLength ? request.password() : "", hash);
        if (!supportedLength || !matches || candidate.isEmpty()
                || candidate.get().passwordHash() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return candidate.get();
    }

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

    public UserResponse getCurrentUser(String userId) {
        try {
            UUID id = UUID.fromString(userId);
            return userRepository.findById(id)
                    .map(UserResponse::from)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED, "Authenticated user no longer exists"));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid authenticated user");
        }
    }
}
