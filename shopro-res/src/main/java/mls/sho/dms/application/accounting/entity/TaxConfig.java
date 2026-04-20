package mls.sho.dms.application.accounting.entity;

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

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(name = "state_code", length = 10)
    private String stateCode;

    @Column(name = "local_code", length = 20)
    private String localCode;

    @Column(name = "tax_name", nullable = false)
    private String taxName;

    @Column(name = "tax_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TaxType taxType;

    @Column(name = "tax_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal taxRate;

    @Column(name = "tax_applies_to", nullable = false)
    @Enumerated(EnumType.STRING)
    private TaxAppliesTo taxAppliesTo;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    @Column(name = "description")
    private String description;

    @Column(name = "account_code")
    private String accountCode;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TaxType {
        FEDERAL_INCOME,
        STATE_INCOME,
        LOCAL_INCOME,
        SOCIAL_SECURITY,
        MEDICARE,
        ADDITIONAL_MEDICARE,
        STATE_UNEMPLOYMENT,
        FEDERAL_UNEMPLOYMENT,
        SALES_TAX,
        VAT,
        GST,
        SERVICE_TAX,
        OTHER
    }

    public enum TaxAppliesTo {
        GROSS_PAY,
        FEDERAL_WAGES,
        STATE_WAGES,
        ALL_WAGES,
        PURCHASE,
        SALES,
        SERVICE
    }
}
