package mls.sho.dms.application.controller.marketplace;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
public class MarketplaceRFQDTO {
    private String id;
    private String ingredientName;
    private BigDecimal requiredQty;
    private LocalDate desiredDeliveryDate;
    private Instant bidDeadline;
    private String buyerName;
}
