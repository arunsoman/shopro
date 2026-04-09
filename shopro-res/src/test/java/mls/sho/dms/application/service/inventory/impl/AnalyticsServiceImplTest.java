package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.service.inventory.dto.TvaReportRow;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.InventoryTransactionRepository;
import mls.sho.dms.repository.inventory.PhysicalCountLineRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceImplTest {

    @Mock
    private RawIngredientRepository ingredientRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private PhysicalCountLineRepository physicalCountRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    @Test
    void generateTvaReport_calculatesVarianceCorrectly() {
        // Arrange
        UUID ingredientId = UUID.randomUUID();
        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        ingredient.setName("Sirloin");
        ingredient.setUnitOfMeasure("KG");

        Instant start = LocalDateTime.now().minusDays(7).toInstant(ZoneOffset.UTC);
        Instant end = LocalDateTime.now().toInstant(ZoneOffset.UTC);

        when(ingredientRepository.findAll()).thenReturn(List.of(ingredient));
        
        // Opening Stock: 10
        when(transactionRepository.sumQuantityDeltasBefore(eq(ingredientId), any())).thenReturn(BigDecimal.valueOf(10));
        
        // Purchases: 20
        when(transactionRepository.sumQuantityDeltasByTypeAndDateRange(
                eq(ingredientId), eq(InventoryTransactionType.PURCHASE_RECEIPT), any(), any()))
                .thenReturn(BigDecimal.valueOf(20));
        
        // Theoretical Usage (Sales): 15
        when(transactionRepository.sumQuantityDeltasByTypeAndDateRange(
                eq(ingredientId), eq(InventoryTransactionType.SALE), any(), any()))
                .thenReturn(BigDecimal.valueOf(-15)); // Sales are negative deltas
        
        // Actual Closing Stock: 12
        when(physicalCountRepository.findLatestCountedQuantityInDateRange(eq(ingredientId), any(), any()))
                .thenReturn(Optional.of(BigDecimal.valueOf(12)));

        // Act
        List<TvaReportRow> report = analyticsService.generateTvaReport(start, end);

        // Assert
        assertFalse(report.isEmpty());
        TvaReportRow row = report.get(0);
        
        // Theor Closing = 10 + 20 - 15 = 15
        assertEquals(BigDecimal.valueOf(15).doubleValue(), row.theoreticalClosingStock().doubleValue());
        assertEquals(BigDecimal.valueOf(12).doubleValue(), row.actualClosingStock().doubleValue());
        
        // Variance = 12 - 15 = -3
        assertEquals(-3.0, row.variance().doubleValue());
        // Variance % = (-3 / 15) * 100 = -20%
        assertEquals(-20.0, row.variancePercentage().doubleValue()); 
        assertTrue(row.isShrinkageAlert());
    }
}
