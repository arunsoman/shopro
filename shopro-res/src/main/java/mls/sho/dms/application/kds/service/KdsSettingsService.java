package mls.sho.dms.application.kds.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.entity.KdsSettings;
import mls.sho.dms.application.kds.repository.KdsSettingsRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class KdsSettingsService {

    private final KdsSettingsRepository settingsRepository;
    
    /**
     * Gets the version of the settings for an outlet.
     * Incrementing this version forces devices to re-fetch settings.
     * Uses the updatedAt epoch second as the version.
     */
    public long getSettingsVersion(Long outletId) {
        return settingsRepository.findByOutletId(outletId)
                .map(s -> s.getUpdatedAt() != null ? s.getUpdatedAt().toEpochSecond(ZoneOffset.UTC) : 0L)
                .orElse(0L);
    }
}
