package nl.hackyourfuture.project.backend.job.dto;

import java.util.List;

public record JobPageResponse(
        List<JobSummaryDto> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}