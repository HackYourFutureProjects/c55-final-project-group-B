package nl.hackyourfuture.project.backend.auth;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nl.hackyourfuture.project.backend.auth.dto.LoginRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy loginSessionStrategy;

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("headerName", csrfToken.getHeaderName(), "token", csrfToken.getToken());
    }

    @PostMapping("/login")
    @Operation(summary = "Log in using a server session")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        LoginUser user = authService.login(request);
        startSession(user.id(), httpRequest, httpResponse);
        return new UserResponse(user.id(), user.name(), user.email());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register and log in a user")
    public UserResponse register(@Valid @RequestBody RegistrationRequest request,
                                 HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        UserResponse user = authService.register(request);
        startSession(user.id(), httpRequest, httpResponse);
        return user;
    }

    private void startSession(UUID userId, HttpServletRequest request, HttpServletResponse response) {
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                userId.toString(), null, List.of());
        loginSessionStrategy.onAuthentication(authentication, request, response);

        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleRegistrationError(ResponseStatusException exception) {
        return exception.getBody();
    }
}
