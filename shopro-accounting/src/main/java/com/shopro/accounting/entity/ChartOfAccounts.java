package com.shopro.accounting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_chart_of_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartOfAccounts {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "account_code", length = 50, nullable = false)
    private String accountCode;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "account_sub_type")
    private String accountSubType;

    @Column(name = "parent_account_id")
    private UUID parentAccountId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_tax_rate", precision = 5, scale = 2)
    private BigDecimal defaultTaxRate;

    @Column(name = "is_taxable")
    private Boolean isTaxable = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "allow_manual_entry")
    private Boolean allowManualEntry = true;

    @Column(name = "balance", precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

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

    public enum AccountType {
        ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    }
}
