package mls.sho.dms.application.inventory.dto;

import lombok.Builder;
import lombok.Data;
import mls.sho.dms.common.enums.InventoryType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class InventoryDtos {

    @Data
    @Builder
    public static class CategorySubtotalDto {
        private String category;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    public static class LatestInventoryDto {
        private LocalDate periodDate;
        private BigDecimal totalValue;
        private List<CategorySubtotalDto> categoryBreakdown;
    }

    @Data
    @Builder
    public static class PhysicalInventoryLineDto {
        private Long id;
        private Long ingredientId;
        private String ingredientName;
        private BigDecimal expectedQty;
        private BigDecimal countedQty;
        private BigDecimal variance;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class PhysicalInventoryPeriodDto {
        private Long id;
        private String periodName;
        private InventoryType inventoryType;
        private LocalDate countDate;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime finalisedAt;
        private List<PhysicalInventoryLineDto> lines;
    }
}
