package com.shopro.accounting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounting_tax_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tax_config_id")
    private UUID taxConfigId;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(name = "state_code", length = 50)
    private String stateCode;

    @Column(name = "local_code", length = 100)
    private String localCode;

    @Column(name = "tax_name", nullable = false)
    private String taxName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type", nullable = false)
    private TaxType taxType;

    @Column(name = "tax_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate;

    @Column(name = "tax_applies_to")
    private String taxAppliesTo;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "account_code", length = 50)
    private String accountCode;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TaxType {
        SALES, INCOME, PAYROLL
    }
}
