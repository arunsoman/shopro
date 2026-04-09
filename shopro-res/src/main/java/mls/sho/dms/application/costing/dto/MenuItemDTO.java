package mls.sho.dms.application.costing.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * DTO for MenuItem entity.
 */
@Data
public class MenuItemDTO {
    private Long id;
    private String name;
    private String posId;
    private BigDecimal sellPriceBuffer;
    private BigDecimal plateCost;
    private BigDecimal targetFoodCostPct;
    private boolean active;
    private Long groupId;
    private String groupName;
    private Integer prepTimeMinutes;
}
