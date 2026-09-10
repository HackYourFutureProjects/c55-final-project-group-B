package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "A job ranked against the current user's skills and location preferences")
public record RecommendedJobDto(
        String jobId,
        String title,
        String companyName,
        String locationCity,
        String locationProvince,
        String description,
        Double latitude,
        Double longitude,
        String created,
        String redirectUrl,
        String ingestedAt,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String salaryDisplay,
        BigDecimal salaryPerHour,
        String employmentType,
        @Schema(description = "Number of the user's saved skills that match this job")
        int matchCount,
        @Schema(description = "The user's saved skills that matched this job")
        List<String> matchedSkills
) {
}
