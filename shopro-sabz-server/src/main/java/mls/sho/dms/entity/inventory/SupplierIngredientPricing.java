package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Stores supplier-specific pricing for raw ingredients, populated via catalog imports (US-8.1).
 * Enables price benchmarking across vendors (US-8.2).
 */
@Entity
@Table(
    name = "supplier_ingredient_pricing",
    indexes = {
        @Index(name = "idx_sip_ingredient", columnList = "ingredient_id"),
        @Index(name = "idx_sip_supplier", columnList = "supplier_id"),
        @Index(name = "uq_sip_supplier_ingredient", columnList = "supplier_id, ingredient_id", unique = true)
    }
)
public class SupplierIngredientPricing extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    /** Price per purchase unit as provided in the supplier's catalog. */
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 4)
    private BigDecimal unitPrice;

    /** The pack size or SKU ID from the vendor's catalog. */
    @Column(name = "vendor_sku", length = 50)
    private String vendorSku;

    /** When the price was last updated via a catalog import. */
    @Column(name = "last_updated_at", nullable = false)
    private Instant lastUpdatedAt = Instant.now();

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getVendorSku() { return vendorSku; }
    public void setVendorSku(String vendorSku) { this.vendorSku = vendorSku; }
    public Instant getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(Instant lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}
