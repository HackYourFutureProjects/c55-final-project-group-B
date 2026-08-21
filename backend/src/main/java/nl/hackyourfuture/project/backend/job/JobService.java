package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<String> getAllJobTitles() {
        return jobRepository.findAllJobTitles();
    }

    public List<String> getDistinctCities() {
        return jobRepository.findAllDistinctCities();
    }
}