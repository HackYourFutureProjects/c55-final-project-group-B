package nl.hackyourfuture.project.backend.profile;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.JobService;
import nl.hackyourfuture.project.backend.profile.dto.UserProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository repository;
    private final JobService jobService;

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
        String normalizedProvince = canonicalLocation(
                normalize(preferredProvince), jobService.getDistinctProvinces(), "province");
        String normalizedCity = canonicalLocation(
                normalize(preferredCity), jobService.getDistinctCities(normalizedProvince), "city");

        repository.save(userId, normalizedCity, normalizedProvince);

        return repository.findByUserId(userId)
                .orElseThrow();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().replaceAll("\\s+", " ");
    }

    private String canonicalLocation(String value, List<String> allowedValues, String field) {
        if (value == null) {
            return null;
        }

        return allowedValues.stream()
                .filter(candidate -> candidate.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported preferred " + field));
    }
}
