package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * DTO for order line responses.
 */
@Data
public class OrderLineResponseDto {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
