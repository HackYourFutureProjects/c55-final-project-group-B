package nl.hackyourfuture.project.backend.job;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    public List<JobSummaryDto> getJobs(
            @RequestParam(required = false)
            @Parameter(description = "Filter by job title (partial, case-insensitive match)")
            String jobTitle,

            @RequestParam(required = false)
            @Parameter(description = "Filter by exact city name")
            String city,

            @RequestParam(required = false)
            @Parameter(description = "Filter by exact province name")
            String province
    ) {
        return jobService.findJobs(jobTitle, city, province);
    }

}
