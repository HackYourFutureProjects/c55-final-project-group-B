package nl.hackyourfuture.project.backend.savedjob;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;

    public void save(UUID userId, String jobId) {
        savedJobRepository.saveJob(userId, jobId);
    }
}
