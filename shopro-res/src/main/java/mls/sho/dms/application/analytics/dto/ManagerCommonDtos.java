package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ManagerCommonDtos {
    @Data public static class AnomalyDto { String message; String severity; }
    @Data public static class ItemStockDto { String name; BigDecimal quantity; String unit; }
    @Data public static class TableStatusDto { String tableNumber; String status; Integer minutesSeated; }
    @Data public static class ServerMetricDto { String name; BigDecimal sales; BigDecimal tipPct; Double satisfactionScore; }
    @Data public static class EventSummaryDto { Long id; String name; LocalDateTime start; Integer count; String status; }
}
