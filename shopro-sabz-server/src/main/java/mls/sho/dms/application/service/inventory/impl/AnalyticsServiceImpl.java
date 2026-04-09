package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.InventoryDashboardResponse;
import mls.sho.dms.application.service.inventory.AnalyticsService;
import mls.sho.dms.application.service.inventory.dto.TvaReportRow;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.InventoryTransactionRepository;
import mls.sho.dms.repository.inventory.PhysicalCountLineRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final RawIngredientRepository ingredientRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PhysicalCountLineRepository countLineRepository;
    private final PurchaseOrderRepository poRepository;

    @Override
    public List<TvaReportRow> generateTvaReport(Instant startDate, Instant endDate) {
        List<RawIngredient> ingredients = ingredientRepository.findAll();
        List<TvaReportRow> report = new ArrayList<>();

        for (RawIngredient ingredient : ingredients) {
            BigDecimal openingStock = getStockAt(ingredient, startDate);

            BigDecimal purchases = transactionRepository.sumQuantityDeltasByTypeAndDateRange(
                    ingredient.getId(), InventoryTransactionType.PURCHASE_RECEIPT, startDate, endDate);

            BigDecimal theorUsageRaw = transactionRepository.sumQuantityDeltasByTypeAndDateRange(
                    ingredient.getId(), InventoryTransactionType.SALE, startDate, endDate);
            BigDecimal theorUsage = theorUsageRaw != null ? theorUsageRaw.abs() : BigDecimal.ZERO;

            BigDecimal theorClosing = openingStock.add(purchases != null ? purchases : BigDecimal.ZERO).subtract(theorUsage);

            BigDecimal actualClosing = countLineRepository.findLatestCountedQuantityInDateRange(
                    ingredient.getId(), startDate, endDate).orElse(theorClosing);

            BigDecimal variance = actualClosing.subtract(theorClosing);
            BigDecimal variancePct = theorUsage.compareTo(BigDecimal.ZERO) != 0 
                    ? variance.divide(theorUsage, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;

            boolean shrinkageAlert = variancePct.abs().compareTo(new BigDecimal("5.0")) > 0;

            report.add(new TvaReportRow(
                    ingredient.getId(),
                    ingredient.getName(),
                    ingredient.getUnitOfMeasure(),
                    openingStock,
                    purchases,
                    theorUsage,
                    theorClosing,
                    actualClosing,
                    variance,
                    variancePct,
                    shrinkageAlert
            ));
        }

        return report;
    }

    @Override
    public InventoryDashboardResponse getDashboardStats() {
        List<PurchaseOrderStatus> activeStatuses = List.of(
                PurchaseOrderStatus.PENDING_APPROVAL,
                PurchaseOrderStatus.APPROVED,
                PurchaseOrderStatus.SENT,
                PurchaseOrderStatus.ACKNOWLEDGED,
                PurchaseOrderStatus.PARTIALLY_RECEIVED,
                PurchaseOrderStatus.DISCREPANCY_REVIEW
        );
        long activePOsCount = poRepository.countByStatusIn(activeStatuses);

        BigDecimal totalValue = ingredientRepository.calculateTotalInventoryValue();
        if (totalValue == null) totalValue = BigDecimal.ZERO;

        Instant monthStart = ZonedDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0)
                .toInstant();
        BigDecimal wasteMTD = transactionRepository.calculateTotalWasteValueSince(monthStart);
        if (wasteMTD == null) wasteMTD = BigDecimal.ZERO;

        return InventoryDashboardResponse.builder()
                .activePOsCount(activePOsCount)
                .totalInventoryValue(totalValue.setScale(2, RoundingMode.HALF_UP))
                .monthlyWasteAmount(wasteMTD.setScale(2, RoundingMode.HALF_UP))
                .wastePercentageOfSales(0.0) 
                .build();
    }

    private BigDecimal getStockAt(RawIngredient ingredient, Instant date) {
        BigDecimal delta = transactionRepository.sumQuantityDeltasBefore(ingredient.getId(), date);
        return delta != null ? delta : BigDecimal.ZERO;
    }
}
