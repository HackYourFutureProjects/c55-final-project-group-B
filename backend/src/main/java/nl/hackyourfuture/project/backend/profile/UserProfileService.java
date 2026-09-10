package nl.hackyourfuture.project.backend.profile;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.profile.dto.UserProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository repository;

    public UserProfileResponse getProfile(UUID userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> new UserProfileResponse(null, null));
    }

    @Transactional
    public UserProfileResponse updateProfile(
            UUID userId,
            String preferredCity,
            String preferredProvince
    ) {
        String normalizedCity = normalize(preferredCity);
        String normalizedProvince = normalize(preferredProvince);

        repository.save(userId, normalizedCity, normalizedProvince);

        return repository.findByUserId(userId)
                .orElseThrow();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}