package nl.hackyourfuture.project.backend.job;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/job-titles")
@RequiredArgsConstructor
@Tag(name = "Job Titles", description = "Operations for retrieving distinct job titles")
public class JobTitleController {

    private final JobService jobService;

    @Operation(summary = "List all job titles", description = "Returns every distinct job title currently published.")
    @ApiResponse(responseCode = "200", description = "The list of job titles")
    @GetMapping
    public List<String> getJobTitles() {
        return jobService.getAllJobTitles();
    }
}
