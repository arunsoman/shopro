package mls.sho.dms.application.costing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.RevenueCategory;

/**
 * DTO for MenuCostGroup entity.
 * Includes revenueCategory for POS sales-mix mapping (Prime Cost reports).
 */
@Data
public class MenuCostGroupDTO {
    private Long id;
    private String name;
    private Integer itemCount;
    private java.math.BigDecimal avgFoodCostPct;
    private Integer displayOrder;
    /** Maps this group to a POS revenue bucket for WeeklyWorksheet sales mix. */
    private RevenueCategory revenueCategory;
}
