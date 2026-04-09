package mls.sho.dms.application.inventory.service;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class InventoryStats {
    private BigDecimal foodInventoryValue;
    private BigDecimal barInventoryValue;
    private long belowParCount;
}
