package mls.sho.dms.application.purchasing.dto;

import lombok.Builder;
import lombok.Data;
import mls.sho.dms.common.enums.PurchaseCategory;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class WeeklySummaryDTO {
    private BigDecimal grandTotal;
    private List<CategoryBreakdownDTO> categoryBreakdown;

    @Data
    @Builder
    public static class CategoryBreakdownDTO {
        private PurchaseCategory purchaseCategory;
        private BigDecimal amount;
        private Double percentage;
    }
}
