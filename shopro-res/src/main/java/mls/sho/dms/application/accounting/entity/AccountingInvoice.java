package mls.sho.dms.application.accounting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_invoice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountingInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_type", nullable = false)
    private InvoiceType invoiceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(name = "subtotal", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "description")
    private String description;

    @Column(name = "notes")
    private String notes;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "ledger_entry_id")
    private UUID ledgerEntryId;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum InvoiceType {
        PURCHASE_INVOICE,
        VENDOR_INVOICE,
        SUPPLIER_INVOICE,
        RENT_INVOICE,
        UTILITY_INVOICE,
        SERVICE_INVOICE,
        OTHER
    }

    public enum InvoiceStatus {
        DRAFT,
        PENDING,
        APPROVED,
        PARTIALLY_PAID,
        PAID,
        OVERDUE,
        DISPUTED,
        CANCELLED
    }
}
