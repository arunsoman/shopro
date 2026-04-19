package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for creating orders via REST API.
 */
@Data
public class OrderCreateDto {
    private String orderNumber;
    private Long sessionId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderLineDto> lines;
}
