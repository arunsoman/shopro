package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PreferredVendorDto {
    private Long id;
    private Long restaurantId;
    private Long ingredientId;
    private String ingredientName;
    private Long supplierId;
    private String supplierName;
    private boolean preferred;
    private BigDecimal unitCost;
    private Integer leadTimeDays;
    private BigDecimal minimumOrderQty;
    private BigDecimal discountPct;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}