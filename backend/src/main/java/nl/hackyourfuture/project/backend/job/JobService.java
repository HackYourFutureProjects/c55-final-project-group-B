package nl.hackyourfuture.project.backend.job;

import lombok.RequiredArgsConstructor;
import nl.hackyourfuture.project.backend.job.dto.JobPageResponse;
import nl.hackyourfuture.project.backend.job.dto.JobSummaryDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<String> getAllJobTitles() {
        return jobRepository.findAllJobTitles();
    }

    public JobPageResponse findJobs(String search, String city, String province, int page, int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Page cannot be negative");
        }
        if (size < 1 || size > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Size must be between 1 and 100");
        }

        List<JobSummaryDto> items = jobRepository.findJobs(search, city, province, page, size);

        long totalItems = jobRepository.countJobs(search, city, province);
        int totalPages;
        if (totalItems == 0) {
            totalPages = 0;
        } else {
            double pages = (double) totalItems / size;
            totalPages = (int) Math.ceil(pages);
        }

        return new JobPageResponse(items, page, size, totalItems, totalPages);
    }

    public List<String> getDistinctCities() {
        return jobRepository.findAllDistinctCities();
    }

    public List<String> getDistinctProvinces() {
        return jobRepository.findAllDistinctProvinces();
    }
}
