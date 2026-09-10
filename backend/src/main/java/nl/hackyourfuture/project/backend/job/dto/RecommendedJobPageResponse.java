package nl.hackyourfuture.project.backend.job.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "A paginated recommendation result")
public record RecommendedJobPageResponse(
        List<RecommendedJobDto> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}
