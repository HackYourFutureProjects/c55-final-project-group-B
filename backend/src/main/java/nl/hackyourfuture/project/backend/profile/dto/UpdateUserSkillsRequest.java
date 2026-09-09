package nl.hackyourfuture.project.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateUserSkillsRequest(
        @NotNull(message = "Skills are required")
        @Size(max = 50, message = "You can save at most 50 skills")
        List<@NotBlank(message = "Skill cannot be blank")
                @Size(max = 100, message = "Skill cannot exceed 100 characters") String> skills
) {
}
