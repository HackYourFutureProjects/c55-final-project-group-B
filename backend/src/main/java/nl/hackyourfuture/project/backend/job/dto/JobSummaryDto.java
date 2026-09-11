package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Summary of a job posting displayed on the homepage")
public record JobSummaryDto(
        @Schema(description = "Stable unique identifier of the job posting")
        String jobId,

        @Schema(description = "Job title as advertised")
        String title,

        @Schema(description = "Name of the hiring company")
        String companyName,

        @Schema(description = "City of the job location, when provided")
        String locationCity,

        @Schema(description = "Province of the job location, when provided")
        String locationProvince,

        @Schema(description = "Job description as advertised")
        String description,

        @Schema(description = "Latitude of the job location, when provided")
        Double latitude,

        @Schema(description = "Longitude of the job location, when provided")
        Double longitude,

        @Schema(description = "When the job posting was created at the source")
        String created,

        @Schema(description = "URL to the original posting on the source website")
        String redirectUrl,

        @Schema(description = "When the pipeline last ingested this record")
        String ingestedAt,

        @Schema(description = "Minimum advertised salary, when provided")
        BigDecimal salaryMin,

        @Schema(description = "Maximum advertised salary, when provided")
        BigDecimal salaryMax,

        @Schema(description = "Formatted salary information, when provided")
        String salaryDisplay,

        @Schema(description = "Hourly salary, when provided")
        BigDecimal salaryPerHour,

        @Schema(description = "Employment type, such as regular job or internship")
        String employmentType,

        @Schema(description = "Contract type, such as full_time, part_time, or unknown")
        String contractType,

        @Schema(description = "Seniority level inferred from the description (junior/mid/senior/unknown)")
        String seniorityLevel,

        @Schema(description = "Language the posting itself is written in")
        String postingLanguage,

        @Schema(description = "Weekly working hours as stated or inferred, when provided")
        String weeklyHours,

        @Schema(description = "Skills extracted from the job description")
        List<String> skills,

        @Schema(description = "Category tag from the source, in English, for display purposes")
        String categoryTag
) {
}
