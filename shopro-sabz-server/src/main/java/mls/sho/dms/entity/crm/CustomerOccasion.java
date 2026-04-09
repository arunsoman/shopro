package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Tracks special occasions (birthday, anniversary) for a customer.
 * One per occasion type per customer.
 */
@Entity
@Table(
    name = "customer_occasion",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_customer_occasion", columnNames = {"customer_profile_id", "occasion_type"})
    },
    indexes = {
        @Index(name = "idx_occasion_customer", columnList = "customer_profile_id")
    }
)
public class CustomerOccasion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_profile_id", nullable = false)
    private CustomerProfile customerProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "occasion_type", nullable = false, length = 30)
    private OccasionType occasionType;

    @Column(name = "occasion_month", nullable = false)
    private int occasionMonth;

    @Column(name = "occasion_day", nullable = false)
    private int occasionDay;

    @Column(name = "occasion_year")
    private Integer occasionYear; // Optional (e.g., birthday year may be omitted)

    public CustomerProfile getCustomerProfile() { return customerProfile; }
    public void setCustomerProfile(CustomerProfile customerProfile) { this.customerProfile = customerProfile; }
    public OccasionType getOccasionType() { return occasionType; }
    public void setOccasionType(OccasionType occasionType) { this.occasionType = occasionType; }
    public int getOccasionMonth() { return occasionMonth; }
    public void setOccasionMonth(int occasionMonth) { this.occasionMonth = occasionMonth; }
    public int getOccasionDay() { return occasionDay; }
    public void setOccasionDay(int occasionDay) { this.occasionDay = occasionDay; }
    public Integer getOccasionYear() { return occasionYear; }
    public void setOccasionYear(Integer occasionYear) { this.occasionYear = occasionYear; }
}
