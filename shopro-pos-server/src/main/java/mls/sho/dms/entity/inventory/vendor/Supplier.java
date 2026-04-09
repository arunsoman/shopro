package mls.sho.dms.entity.inventory.vendor;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

/**
 * Represents a vendor or food supplier from whom the restaurant purchases ingredients.
 * Required for automated Purchase Order dispatch (US-7.2 Inventory).
 */
@Entity
@Table(
    name = "supplier",
    indexes = {
        @Index(name = "uq_supplier_company_name", columnList = "company_name", unique = true)
    }
)
public class Supplier extends BaseEntity {

    @Column(name = "company_name", nullable = false, length = 120)
    private String companyName;

    @Column(name = "contact_name", length = 100)
    private String contactName;

    @Column(name = "contact_email", length = 254)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    /** Default lead time in calendar days from PO dispatch to delivery. */
    @Column(name = "lead_time_days", nullable = false)
    private int leadTimeDays = 1;

    /** 0-100 score maintained via exponential moving average updated on PO close. Default 70 for new vendor. */
    @Column(name = "vendor_rating", nullable = false, precision = 5, scale = 2)
    private BigDecimal vendorRating = new BigDecimal("70.00");

    @Column(name = "lead_time_variance", nullable = false, precision = 5, scale = 2)
    private BigDecimal leadTimeVariance = BigDecimal.ZERO;

    @Column(name = "reliability_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal reliabilityScore = new BigDecimal("100.00");

    @Column(name = "min_order_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(name = "bid_eligible", nullable = false)
    private boolean bidEligible = true;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "categories", columnDefinition = "jsonb")
    private List<String> categories = new ArrayList<>();

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public int getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(int leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    public BigDecimal getVendorRating() { return vendorRating; }
    public void setVendorRating(BigDecimal vendorRating) { this.vendorRating = vendorRating; }
    public BigDecimal getLeadTimeVariance() { return leadTimeVariance; }
    public void setLeadTimeVariance(BigDecimal leadTimeVariance) { this.leadTimeVariance = leadTimeVariance; }
    public BigDecimal getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(BigDecimal reliabilityScore) { this.reliabilityScore = reliabilityScore; }
    public BigDecimal getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(BigDecimal minOrderValue) { this.minOrderValue = minOrderValue; }
    public boolean isBidEligible() { return bidEligible; }
    public void setBidEligible(boolean bidEligible) { this.bidEligible = bidEligible; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
}
