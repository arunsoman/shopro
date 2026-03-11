package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CounterOfferRequest {
    private BigDecimal proposedPrice;
    private BigDecimal proposedQuantity;
    private String reason;
}
