package mls.sho.dms.service.management;

import mls.sho.dms.entity.management.ManagementProfile;
import mls.sho.dms.repository.management.ManagementProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ManagementProfileService {

    private final ManagementProfileRepository repository;

    public ManagementProfileService(ManagementProfileRepository repository) {
        this.repository = repository;
    }

    public Optional<ManagementProfile> getProfile() {
        return repository.findAll().stream().findFirst();
    }

    public ManagementProfile saveProfile(ManagementProfile profile) {
        // We only ever want one global profile.
        // If one exists, update it. If not, create it.
        return repository.findAll().stream().findFirst()
            .map(existing -> {
                existing.setRestaurantName(profile.getRestaurantName());
                existing.setWeekStartDate(profile.getWeekStartDate());
                existing.setTaxesBenefitsRate(profile.getTaxesBenefitsRate());
                return repository.save(existing);
            })
            .orElseGet(() -> repository.save(profile));
    }
}
