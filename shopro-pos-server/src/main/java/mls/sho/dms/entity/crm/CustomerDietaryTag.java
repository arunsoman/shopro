package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Tracks a dietary restriction or allergy for a customer.
 * Multiple tags per customer, unique by tag type.
 */
@Entity
@Table(
    name = "customer_dietary_tag",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_customer_dietary_tag", columnNames = {"customer_profile_id", "tag_type"})
    },
    indexes = {
        @Index(name = "idx_dietary_tag_customer", columnList = "customer_profile_id")
    }
)
public class CustomerDietaryTag extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_profile_id", nullable = false)
    private CustomerProfile customerProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag_type", nullable = false, length = 30)
    private DietaryTagType tagType;

    @Column(name = "custom_description", length = 200)
    private String customDescription; // Used only when tagType == OTHER

    public CustomerProfile getCustomerProfile() { return customerProfile; }
    public void setCustomerProfile(CustomerProfile customerProfile) { this.customerProfile = customerProfile; }
    public DietaryTagType getTagType() { return tagType; }
    public void setTagType(DietaryTagType tagType) { this.tagType = tagType; }
    public String getCustomDescription() { return customDescription; }
    public void setCustomDescription(String customDescription) { this.customDescription = customDescription; }
}
