package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

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
        OffsetDateTime created,

        @Schema(description = "URL to the original posting on the source website")
        String redirectUrl,

        @Schema(description = "When the pipeline last ingested this record")
        OffsetDateTime ingestedAt
) {
}