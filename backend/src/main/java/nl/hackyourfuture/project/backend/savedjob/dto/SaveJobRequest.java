package nl.hackyourfuture.project.backend.savedjob.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "The job a user wants to save")
public record SaveJobRequest(

        @NotBlank(message = "Please provide a jobId")
        @Schema(description = "Id of the job posting", example = "5813234784")
        String jobId
) {}