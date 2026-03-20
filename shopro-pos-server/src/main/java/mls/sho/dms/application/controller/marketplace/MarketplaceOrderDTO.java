package mls.sho.dms.application.controller.marketplace;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class MarketplaceOrderDTO {
    private String id;
    private BigDecimal totalValue;
    private String status;
    private Instant createdAt;
    private String sellerName;
    private String buyerName;
}
