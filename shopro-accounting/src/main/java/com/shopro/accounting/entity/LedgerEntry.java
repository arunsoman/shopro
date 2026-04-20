package com.shopro.accounting.entity;

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
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "entry_id")
    private UUID entryId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private EntryType entryType;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "account_code", nullable = false, length = 50)
    private String accountCode;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "debit_amount", precision = 15, scale = 2)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(name = "credit_amount", precision = 15, scale = 2)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private TransactionCategory category;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_reconciled")
    private Boolean isReconciled = false;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum EntryType {
        JOURNAL, ADJUSTMENT, SALES, PAYROLL, EXPENSE, PAYMENT, TRANSFER
    }

    public enum TransactionCategory {
        SALES, EXPENSE, PAYROLL, TAX, TRANSFER, ADJUSTMENT
    }
}
