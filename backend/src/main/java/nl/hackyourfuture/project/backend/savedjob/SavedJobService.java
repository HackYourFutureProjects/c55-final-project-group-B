package nl.hackyourfuture.project.backend.savedjob;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;

    public void save(UUID userId, String jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        savedJobRepository.saveJob(userId, jobId);
    }
}
