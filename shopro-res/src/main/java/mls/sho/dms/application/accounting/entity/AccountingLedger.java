package mls.sho.dms.application.accounting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_ledger")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountingLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "entry_id")
    private UUID entryId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "entry_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EntryType entryType;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "description")
    private String description;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "account_code")
    private String accountCode;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "debit_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(name = "credit_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "exchange_rate", precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "category")
    private String category;

    @Column(name = "notes")
    private String notes;

    @Column(name = "is_reconciled")
    @Builder.Default
    private Boolean isReconciled = false;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (transactionDate == null) {
            transactionDate = LocalDate.now();
        }
    }

    public enum EntryType {
        JOURNAL_ENTRY,
        SALARY_PAYMENT,
        TAX_PAYMENT,
        INVOICE_PAYMENT,
        PURCHASE,
        SALES,
        ADJUSTMENT,
        OPENING_BALANCE
    }
}
