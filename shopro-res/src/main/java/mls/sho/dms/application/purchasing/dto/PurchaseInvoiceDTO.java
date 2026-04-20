package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import mls.sho.dms.application.purchasing.entity.PurchaseInvoice.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for PurchaseInvoice entity.
 */
@Data
public class PurchaseInvoiceDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long goodsReceiptId;
    private LocalDate invoiceDate;
    private String invoiceNumber;
    private BigDecimal invoiceAmount;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PurchaseOrderLineDTO> lines;
}
