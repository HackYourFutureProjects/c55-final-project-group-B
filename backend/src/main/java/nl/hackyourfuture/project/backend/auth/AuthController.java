package nl.hackyourfuture.project.backend.auth;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.auth.dto.RegistrationRequest;
import nl.hackyourfuture.project.backend.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a user")
    public UserResponse register(@Valid @RequestBody RegistrationRequest request) {
        return authService.register(request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleRegistrationError(ResponseStatusException exception) {
        return exception.getBody();
    }
}
