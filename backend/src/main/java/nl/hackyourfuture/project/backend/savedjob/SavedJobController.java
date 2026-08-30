package nl.hackyourfuture.project.backend.savedjob;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.savedjob.dto.SaveJobRequest;
import nl.hackyourfuture.project.backend.savedjob.dto.SavedJobResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    @ApiResponse(responseCode = "404", description = "The job does not exist")
    public void saveJob(@Valid @RequestBody SaveJobRequest request, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        savedJobService.save(userId, request.jobId());
    }


    @GetMapping
    @Operation(summary = "List saved jobs", description = "Returns the current user's saved job postings, most recently saved first.")
    @ApiResponse(responseCode = "200", description = "The list of saved jobs")
    public List<SavedJobResponse> getSavedJobs(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return savedJobService.getSavedJobs(userId);
    }


    @DeleteMapping("/{jobId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Unsave a job", description = "Removes a job posting from the current user's saved jobs.")
    @ApiResponse(responseCode = "204", description = "The job was removed")
    @ApiResponse(responseCode = "404", description = "The job was not in the user's saved jobs")
    public void deleteSavedJob(@PathVariable String jobId, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        savedJobService.deleteSavedJob(userId, jobId);
    }
    
}