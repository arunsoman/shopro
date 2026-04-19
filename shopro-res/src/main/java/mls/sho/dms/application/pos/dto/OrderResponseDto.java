package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for order responses - includes only safe fields.
 */
@Data
public class OrderResponseDto {
    private Long id;
    private String orderNumber;
    private Long sessionId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderLineResponseDto> lines;
}
