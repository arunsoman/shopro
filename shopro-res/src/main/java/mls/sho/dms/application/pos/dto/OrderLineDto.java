package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderLineDto {
    private Long id;
    private Long menuItemId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
