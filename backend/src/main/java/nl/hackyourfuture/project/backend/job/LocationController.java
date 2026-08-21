package nl.hackyourfuture.project.backend.job;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Locations", description = "Operations for retrieving distinct location values")
public class LocationController {

    private final JobService jobService;

    @Operation(summary = "Get all distinct cities")
    @GetMapping("/cities")
    public List<String> getCities() {
        return jobService.getDistinctCities();
    }
    
}
