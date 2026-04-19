package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for menu item responses.
 */
@Data
public class MenuItemDto {
    private Long id;
    private String posId;
    private String name;
    private BigDecimal sellPrice;
    private Boolean active;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
