package com.shopro.accounting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_salary_disbursement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryDisbursement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "disbursement_id")
    private UUID disbursementId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "staff_name", nullable = false)
    private String staffName;

    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @Column(name = "pay_date", nullable = false)
    private LocalDate payDate;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "gross_pay", precision = 15, scale = 2, nullable = false)
    private BigDecimal grossPay;

    @Column(name = "federal_tax", precision = 15, scale = 2)
    private BigDecimal federalTax = BigDecimal.ZERO;

    @Column(name = "state_tax", precision = 15, scale = 2)
    private BigDecimal stateTax = BigDecimal.ZERO;

    @Column(name = "local_tax", precision = 15, scale = 2)
    private BigDecimal localTax = BigDecimal.ZERO;

    @Column(name = "social_security_tax", precision = 15, scale = 2)
    private BigDecimal socialSecurityTax = BigDecimal.ZERO;

    @Column(name = "medicare_tax", precision = 15, scale = 2)
    private BigDecimal medicareTax = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 15, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "total_tax", precision = 15, scale = 2)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "net_pay", precision = 15, scale = 2, nullable = false)
    private BigDecimal netPay;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DisbursementStatus status;

    @Column(name = "ledger_entry_id")
    private UUID ledgerEntryId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = DisbursementStatus.PENDING;
    }

    public enum PaymentMethod {
        CASH, CHECK, BANK
    }

    public enum DisbursementStatus {
        PENDING, PROCESSED, DISBURSED
    }
}
