package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<String> getAllJobTitles() {
        return jobRepository.findAllJobTitles();
    }

    public List<JobSummaryDto> findJobs(String jobTitle, String city, String province) {
        return jobRepository.findJobs(jobTitle, city, province);
    }

    public List<String> getDistinctCities() {
        return jobRepository.findAllDistinctCities();
    }

    public List<String> getDistinctProvinces() {
        return jobRepository.findAllDistinctProvinces();
    }
}