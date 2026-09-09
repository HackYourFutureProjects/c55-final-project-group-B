package nl.hackyourfuture.project.backend.profile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.profile.dto.UpdateUserSkillsRequest;
import nl.hackyourfuture.project.backend.profile.dto.UserSkillsResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile/skills")
@RequiredArgsConstructor
@Tag(name = "Profile Skills", description = "Operations on the current user's profile skills")
public class UserSkillController {

    private final UserSkillService userSkillService;

    @GetMapping
    @Operation(summary = "Get the current user's saved skills")
    public UserSkillsResponse getSkills(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return new UserSkillsResponse(userSkillService.getSkills(userId));
    }

    @PutMapping
    @Operation(summary = "Replace the current user's saved skills")
    public UserSkillsResponse replaceSkills(Authentication authentication,
                                            @Valid @RequestBody UpdateUserSkillsRequest request) {
        UUID userId = UUID.fromString(authentication.getName());
        return new UserSkillsResponse(userSkillService.replaceSkills(userId, request.skills()));
    }
}
