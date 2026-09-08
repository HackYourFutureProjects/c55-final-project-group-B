package nl.hackyourfuture.project.backend.job;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobPageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Operations for retrieving job postings")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(
            summary = "List jobs",
            description = "Returns jobs ordered by publication date, newest first. " +
                    "Supports optional filtering by job title (partial match), city, and province."
    )
    @ApiResponse(responseCode = "200", description = "Jobs retrieved successfully")
    public JobPageResponse getJobs(
            @RequestParam(required = false)
            @Parameter(description = "Search across job title, description, company name, and skill (partial, case-insensitive match)")
            String search,

            @RequestParam(required = false)
            @Parameter(description = "Filter by exact city name")
            String city,

            @RequestParam(required = false)
            @Parameter(description = "Filter by exact province name")
            String province,

            @RequestParam(defaultValue = "0")
            @Parameter(description = "Zero-based page number")
            int page,

            @RequestParam(defaultValue = "10")
            @Parameter(description = "Number of jobs per page, from 1 to 100")
            int size
    ) {
        return jobService.findJobs(search, city, province, page, size);
    }

}
