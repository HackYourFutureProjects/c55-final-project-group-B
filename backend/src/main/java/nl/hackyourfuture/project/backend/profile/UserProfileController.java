package nl.hackyourfuture.project.backend.profile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.profile.dto.UpdateUserProfileRequest;
import nl.hackyourfuture.project.backend.profile.dto.UserProfileResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile")
public class UserProfileController {

    private final UserProfileService service;

    @GetMapping
    @Operation(summary = "Get the current user's profile")
    public UserProfileResponse getProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return service.getProfile(userId);
    }

    @PutMapping
    @Operation(summary = "Update the current user's profile")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());

        return service.updateProfile(
                userId,
                request.preferredCity(),
                request.preferredProvince()
        );
    }
}