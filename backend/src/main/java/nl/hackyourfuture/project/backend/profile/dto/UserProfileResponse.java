package nl.hackyourfuture.project.backend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "The current user's job location preferences")
public record UserProfileResponse(
        @Schema(description = "Preferred city, when provided")
        String preferredCity,

        @Schema(description = "Preferred province, when provided")
        String preferredProvince
) {
}