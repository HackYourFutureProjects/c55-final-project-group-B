package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

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


        @Schema(description = "Contract type, such as full-time or part-time")
        String contractType,

        @Schema(description = "Hourly salary, when provided")
        BigDecimal salaryPerHour,

        @Schema(description = "Employment type, such as regular job or internship")
        String employmentType
) {
}
