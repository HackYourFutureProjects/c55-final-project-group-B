package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Summary of a job posting displayed on the homepage")
public record JobSummaryDto(
        @Schema(description = "Stable unique identifier of the job posting")
        String postingId,

        @Schema(description = "Job title as advertised")
        String title,

        @Schema(description = "Name of the hiring company")
        String companyName,

        @Schema(description = "Job location, when provided")
        String location,

        @Schema(description = "Whether the job is advertised as remote")
        boolean isRemote,

        @Schema(description = "Discipline assigned to the job")
        String discipline,

        @Schema(description = "When the job was published")
        OffsetDateTime postedAt
) {
}
