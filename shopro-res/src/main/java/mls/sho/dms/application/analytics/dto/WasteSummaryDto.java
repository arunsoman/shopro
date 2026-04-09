package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteSummaryDto {
    private BigDecimal totalWasteValue;
    private List<WasteItemDto> topWasteItems;
    private Map<String, BigDecimal> wasteByReason;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteItemDto {
        private String ingredientName;
        private BigDecimal totalValue;
        private BigDecimal quantity;
        private String unit;
    }
}
