package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for PurchaseOrder entity.
 */
@Data
public class PurchaseOrderDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime issueDate;
    private BigDecimal totalAmount;
    private PurchaseOrderStatus status;
    private String notes;
    private List<PurchaseOrderLineDTO> lines;
}
