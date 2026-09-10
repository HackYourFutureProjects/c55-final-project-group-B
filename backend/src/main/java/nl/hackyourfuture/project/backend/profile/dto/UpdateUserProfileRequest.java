package nl.hackyourfuture.project.backend.profile.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @Size(max = 100, message = "Preferred city cannot exceed 100 characters")
        String preferredCity,

        @Size(
                max = 100,
                message = "Preferred province cannot exceed 100 characters"
        )
        String preferredProvince
) {
}