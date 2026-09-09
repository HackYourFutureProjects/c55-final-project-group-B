package nl.hackyourfuture.project.backend.profile.dto;

import java.util.List;

public record UserSkillsResponse(
        List<String> skills
) {
}
