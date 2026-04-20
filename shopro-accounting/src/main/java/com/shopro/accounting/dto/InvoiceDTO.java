package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class InvoiceDTO {

    @Data
    @Builder
    public static class InvoiceRequest {
        private Long restaurantId;
        private String invoiceNumber;
        private UUID supplierId;
        private String supplierName;
        private LocalDate invoiceDate;
        private LocalDate dueDate;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String paymentTerms;
        private String referenceNumber;
        private String createdBy;
    }

    @Data
    @Builder
    public static class PaymentRequest {
        private UUID invoiceId;
        private UUID paymentMethodAccountId;
        private BigDecimal amount;
        private LocalDate paymentDate;
        private String paymentReference;
        private String createdBy;
    }

    @Data
    @Builder
    public static class InvoiceResponse {
        private UUID invoiceId;
        private String invoiceNumber;
        private String supplierName;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private String status;
        private LocalDate dueDate;
    }
}
