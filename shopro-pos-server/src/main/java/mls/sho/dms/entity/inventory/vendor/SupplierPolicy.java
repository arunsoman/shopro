package mls.sho.dms.entity.inventory.vendor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Per-supplier configuration for procurement policies and tolerances.
 */
@Entity
@Table(name = "supplier_policy")
public class SupplierPolicy {

    @Id
    @Column(name = "supplier_id")
    private UUID supplierId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "auto_acknowledge", nullable = false)
    private boolean autoAcknowledge = false;

    @Column(name = "counter_offer_allowed", nullable = false)
    private boolean counterOfferAllowed = true;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "qty_tolerance", precision = 5, scale = 2)
    private BigDecimal qtyTolerance = new BigDecimal("5.00");

    @Column(name = "price_tolerance", precision = 5, scale = 2)
    private BigDecimal priceTolerance = new BigDecimal("2.00");

    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public boolean isAutoAcknowledge() { return autoAcknowledge; }
    public void setAutoAcknowledge(boolean autoAcknowledge) { this.autoAcknowledge = autoAcknowledge; }
    public boolean isCounterOfferAllowed() { return counterOfferAllowed; }
    public void setCounterOfferAllowed(boolean counterOfferAllowed) { this.counterOfferAllowed = counterOfferAllowed; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public BigDecimal getQtyTolerance() { return qtyTolerance; }
    public void setQtyTolerance(BigDecimal qtyTolerance) { this.qtyTolerance = qtyTolerance; }
    public BigDecimal getPriceTolerance() { return priceTolerance; }
    public void setPriceTolerance(BigDecimal priceTolerance) { this.priceTolerance = priceTolerance; }
}
