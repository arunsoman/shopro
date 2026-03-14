package mls.sho.dms.tax.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;

/**
 * Defines a specific tax rule within a country's jurisdiction.
 * Supports conditional application based on order type, item temperature, and price thresholds.
 */
@Entity
@Table(name = "tax_rules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"country_id", "rule_code"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TaxRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    @JsonBackReference
    private Country country;

    @Column(name = "rule_code", nullable = false, length = 50)
    private String ruleCode;

    @Column(name = "rule_name", nullable = false, length = 150)
    private String ruleName;

    @Column(name = "tax_type", nullable = false, length = 50)
    private String taxType;

    @Column(name = "default_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal defaultRate;

    @Column(name = "min_allowed_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal minAllowedRate;

    @Column(name = "max_allowed_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal maxAllowedRate;

    @Column(name = "applies_to_dine_in", nullable = false)
    private boolean appliesToDineIn = true;

    @Column(name = "applies_to_takeaway", nullable = false)
    private boolean appliesToTakeaway = true;

    @Column(name = "applies_to_hot")
    private Boolean appliesToHot;

    @Column(name = "applies_to_cold")
    private Boolean appliesToCold;

    @Column(name = "applies_to_alcohol", nullable = false)
    private boolean appliesToAlcohol = false;

    @Column(name = "item_category", length = 50)
    private String itemCategory;

    @Column(name = "price_threshold_min", precision = 12, scale = 2)
    private BigDecimal priceThresholdMin;

    @Column(name = "price_threshold_max", precision = 12, scale = 2)
    private BigDecimal priceThresholdMax;

    @Column(name = "is_cascading", nullable = false)
    private boolean cascading = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cascade_on_rule_id")
    @JsonIgnore
    private TaxRule cascadeOnRule;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public Country getCountry() { return country; }
    public void setCountry(Country country) { this.country = country; }
    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }
    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public BigDecimal getDefaultRate() { return defaultRate; }
    public void setDefaultRate(BigDecimal defaultRate) { this.defaultRate = defaultRate; }
    public BigDecimal getMinAllowedRate() { return minAllowedRate; }
    public void setMinAllowedRate(BigDecimal minAllowedRate) { this.minAllowedRate = minAllowedRate; }
    public BigDecimal getMaxAllowedRate() { return maxAllowedRate; }
    public void setMaxAllowedRate(BigDecimal maxAllowedRate) { this.maxAllowedRate = maxAllowedRate; }
    public boolean isAppliesToDineIn() { return appliesToDineIn; }
    public void setAppliesToDineIn(boolean appliesToDineIn) { this.appliesToDineIn = appliesToDineIn; }
    public boolean isAppliesToTakeaway() { return appliesToTakeaway; }
    public void setAppliesToTakeaway(boolean appliesToTakeaway) { this.appliesToTakeaway = appliesToTakeaway; }
    public Boolean getAppliesToHot() { return appliesToHot; }
    public void setAppliesToHot(Boolean appliesToHot) { this.appliesToHot = appliesToHot; }
    public Boolean getAppliesToCold() { return appliesToCold; }
    public void setAppliesToCold(Boolean appliesToCold) { this.appliesToCold = appliesToCold; }
    public boolean isAppliesToAlcohol() { return appliesToAlcohol; }
    public void setAppliesToAlcohol(boolean appliesToAlcohol) { this.appliesToAlcohol = appliesToAlcohol; }
    public String getItemCategory() { return itemCategory; }
    public void setItemCategory(String itemCategory) { this.itemCategory = itemCategory; }
    public BigDecimal getPriceThresholdMin() { return priceThresholdMin; }
    public void setPriceThresholdMin(BigDecimal priceThresholdMin) { this.priceThresholdMin = priceThresholdMin; }
    public BigDecimal getPriceThresholdMax() { return priceThresholdMax; }
    public void setPriceThresholdMax(BigDecimal priceThresholdMax) { this.priceThresholdMax = priceThresholdMax; }
    public boolean isCascading() { return cascading; }
    public void setCascading(boolean cascading) { this.cascading = cascading; }
    public TaxRule getCascadeOnRule() { return cascadeOnRule; }
    public void setCascadeOnRule(TaxRule cascadeOnRule) { this.cascadeOnRule = cascadeOnRule; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
