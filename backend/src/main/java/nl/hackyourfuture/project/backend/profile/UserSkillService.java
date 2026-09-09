package nl.hackyourfuture.project.backend.profile;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;

    public List<String> getSkills(UUID userId) {
        return userSkillRepository.findByUserId(userId);
    }

    @Transactional
    public List<String> replaceSkills(UUID userId, List<String> skills) {
        List<String> normalizedSkills = skills.stream()
                .map(String::trim)
                .map(skill -> skill.toLowerCase(Locale.ROOT))
                .distinct()
                .sorted()
                .toList();

        userSkillRepository.deleteByUserId(userId);
        userSkillRepository.saveAll(userId, normalizedSkills);

        return userSkillRepository.findByUserId(userId);
    }
}
