package mls.sho.dms.tax.entity;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Stores the results of tax calculations for historical reporting and audit.
 */
@Entity
@Table(name = "tax_calculation_results", indexes = {
    @Index(name = "idx_tax_calc_ticket_res", columnList = "ticket_id")
})
public class TaxCalculationResult extends BaseEntity {

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "ticket_item_id", nullable = false)
    private UUID ticketItemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tax_rule_id", nullable = false)
    private TaxRule taxRule;

    @Column(name = "rule_code", nullable = false, length = 50)
    private String ruleCode;

    @Column(name = "base_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "tax_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal taxRate;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "order_type", nullable = false, length = 20)
    private String orderType;

    @Column(name = "item_temperature", length = 10)
    private String itemTemperature;

    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt = Instant.now();

    public UUID getTicketId() { return ticketId; }
    public void setTicketId(UUID ticketId) { this.ticketId = ticketId; }
    public UUID getTicketItemId() { return ticketItemId; }
    public void setTicketItemId(UUID ticketItemId) { this.ticketItemId = ticketItemId; }
    public TaxRule getTaxRule() { return taxRule; }
    public void setTaxRule(TaxRule taxRule) { this.taxRule = taxRule; }
    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public String getItemTemperature() { return itemTemperature; }
    public void setItemTemperature(String itemTemperature) { this.itemTemperature = itemTemperature; }
    public Instant getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; }
}
