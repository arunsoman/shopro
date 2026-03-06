package mls.sho.dms.application.service.inventory.job;

import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockThresholdJobTest {

    @Mock
    private RawIngredientRepository ingredientRepository;

    @Mock
    private AlertService alertService;

    @Mock
    private RFQService rfqService;

    @InjectMocks
    private StockThresholdJob stockThresholdJob;

    private RawIngredient normalIngredient;
    private RawIngredient safetyIngredient;
    private RawIngredient criticalIngredient;

    @BeforeEach
    void setUp() {
        normalIngredient = new RawIngredient();
        normalIngredient.setId(UUID.randomUUID());
        normalIngredient.setCurrentStock(BigDecimal.valueOf(50));
        normalIngredient.setParLevel(BigDecimal.valueOf(40));
        normalIngredient.setSafetyLevel(BigDecimal.valueOf(20));
        normalIngredient.setCriticalLevel(BigDecimal.valueOf(10));

        safetyIngredient = new RawIngredient();
        safetyIngredient.setId(UUID.randomUUID());
        safetyIngredient.setCurrentStock(BigDecimal.valueOf(15));
        safetyIngredient.setParLevel(BigDecimal.valueOf(40));
        safetyIngredient.setSafetyLevel(BigDecimal.valueOf(20));
        safetyIngredient.setCriticalLevel(BigDecimal.valueOf(10));

        criticalIngredient = new RawIngredient();
        criticalIngredient.setId(UUID.randomUUID());
        criticalIngredient.setCurrentStock(BigDecimal.valueOf(5));
        criticalIngredient.setParLevel(BigDecimal.valueOf(40));
        criticalIngredient.setSafetyLevel(BigDecimal.valueOf(20));
        criticalIngredient.setCriticalLevel(BigDecimal.valueOf(10));
    }

    @Test
    void evaluateStockThresholds_dispatchesCorrectAlerts() {
        // Arrange
        when(ingredientRepository.findAll()).thenReturn(List.of(
                normalIngredient, safetyIngredient, criticalIngredient
        ));

        // Act
        stockThresholdJob.evaluateStockThresholds();

        // Assert
        verify(alertService, never()).sendSafetyStockAlert(normalIngredient);
        verify(alertService, never()).sendCriticalStockAlert(normalIngredient);

        verify(alertService).sendSafetyStockAlert(safetyIngredient);
        verify(alertService, never()).sendCriticalStockAlert(safetyIngredient);

        verify(alertService).sendCriticalStockAlert(criticalIngredient);
        verify(alertService, never()).sendSafetyStockAlert(criticalIngredient);
    }

    @Test
    void evaluateStockThresholds_debouncesSubsequentAlerts() {
        // Arrange
        when(ingredientRepository.findAll()).thenReturn(List.of(criticalIngredient));

        // Act
        stockThresholdJob.evaluateStockThresholds();
        stockThresholdJob.evaluateStockThresholds(); // Call a second time immediately

        // Assert
        // Should only be called once due to 24h debounce logic
        verify(alertService, times(1)).sendCriticalStockAlert(criticalIngredient);
    }

    @Test
    void evaluateStockThresholds_triggersRfqIfAutoReplenish() {
        // Arrange
        RawIngredient reorderIngredient = new RawIngredient();
        reorderIngredient.setId(UUID.randomUUID());
        reorderIngredient.setCurrentStock(BigDecimal.valueOf(15));
        reorderIngredient.setParLevel(BigDecimal.valueOf(40));
        reorderIngredient.setReorderPoint(BigDecimal.valueOf(20));
        reorderIngredient.setAutoReplenish(true);
        // Note: No safety/critical levels breached

        when(ingredientRepository.findAll()).thenReturn(List.of(reorderIngredient));

        // Act
        stockThresholdJob.evaluateStockThresholds();

        // Assert
        verify(rfqService, times(1)).generateRfqIfEligible(reorderIngredient);
        verify(alertService, never()).sendCriticalStockAlert(any());
        verify(alertService, never()).sendSafetyStockAlert(any());
    }
}
