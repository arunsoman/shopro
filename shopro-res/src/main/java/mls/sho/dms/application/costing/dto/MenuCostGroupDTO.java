package mls.sho.dms.application.costing.dto;

import lombok.Data;

/**
 * DTO for MenuCostGroup entity.
 */
@Data
public class MenuCostGroupDTO {
    private Long id;
    private String name;
    private Integer itemCount;
    private java.math.BigDecimal avgFoodCostPct;
    private Integer displayOrder;
}
