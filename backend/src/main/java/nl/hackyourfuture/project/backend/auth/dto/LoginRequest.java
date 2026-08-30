package nl.hackyourfuture.project.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Locale;

public record LoginRequest(
        @NotBlank(message = "Please provide an email")
        @Email(message = "Please provide a valid email address")
        @Size(max = 100)
        String email,
        @NotBlank(message = "Please provide a password")
        @Size(max = 1024)
        String password
) {
    public LoginRequest {
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    public String toString() {
        return "LoginRequest[credentials redacted]";
    }
}
