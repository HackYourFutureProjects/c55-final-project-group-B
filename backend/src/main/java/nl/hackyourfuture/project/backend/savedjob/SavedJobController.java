package nl.hackyourfuture.project.backend.savedjob;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.savedjob.dto.SaveJobRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Operations on a user's saved job postings")
public class SavedJobController {

    private final SavedJobService savedJobService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save a job", description = "Adds a job posting to the current user's saved jobs.")
    @ApiResponse(responseCode = "201", description = "The job was saved")
    public void save(@Valid @RequestBody SaveJobRequest request, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        savedJobService.save(userId, request.jobId());
    }
}