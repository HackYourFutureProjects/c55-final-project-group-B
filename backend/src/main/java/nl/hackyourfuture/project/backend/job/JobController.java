package nl.hackyourfuture.project.backend.job;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
            description = "Returns all jobs ordered by publication date, newest first."
    )
    @ApiResponse(responseCode = "200", description = "Jobs retrieved successfully")
    public List<JobSummaryDto> getJobs() {
        return jobService.findJobs();
    }
}
