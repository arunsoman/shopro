package mls.sho.dms.application.kds.service;

import mls.sho.dms.application.kds.entity.KdsSettings;
import mls.sho.dms.application.kds.repository.KdsSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class KdsSettingsServiceTest {

    @Mock private KdsSettingsRepository settingsRepository;

    @InjectMocks
    private KdsSettingsService kdsSettingsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSettingsVersion_ReturnsEpochSecond() {
        // Arrange
        Long outletId = 1L;
        LocalDateTime now = LocalDateTime.now();
        KdsSettings settings = KdsSettings.builder().id(101L).updatedAt(now).build();

        when(settingsRepository.findByOutletId(outletId)).thenReturn(Optional.of(settings));

        // Act
        long result = kdsSettingsService.getSettingsVersion(outletId);

        // Assert
        assertEquals(now.toEpochSecond(ZoneOffset.UTC), result);
    }

    @Test
    void testGetSettingsVersion_ReturnsZeroIfNotFound() {
        // Arrange
        Long outletId = 1L;
        when(settingsRepository.findByOutletId(outletId)).thenReturn(Optional.empty());

        // Act
        long result = kdsSettingsService.getSettingsVersion(outletId);

        // Assert
        assertEquals(0L, result);
    }
}
