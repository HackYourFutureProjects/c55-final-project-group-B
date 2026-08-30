package nl.hackyourfuture.project.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Locale;

@Schema(description = "The details needed to register a user")
public record RegistrationRequest(
        @NotBlank(message = "Please provide a name")
        @Size(min = 2, max = 100, message = "Name must contain between 2 and 100 characters")
        @Schema(example = "Thomas Nick")
        String name,

        @NotBlank(message = "Please provide an email")
        @Email(message = "Please provide a valid email address")
        @Size(max = 100, message = "Email cannot exceed 100 characters")
        @Schema(example = "user@example.com")
        String email,

        @NotBlank(message = "Please provide a password")
        @Size(min = 8, max = 72, message = "Password must contain between 8 and 72 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain uppercase, lowercase, and number"
        )
        @Schema(example = "StrongPass1")
        String password
) {
    public RegistrationRequest {
        name = name == null ? null : name.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
