package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * CustomerProfile tracks guest contact info, preferences, and aggregate loyalty data.
 */
@Entity
@Table(
    name = "customer_profile",
    indexes = {
        @Index(name = "idx_customer_phone", columnList = "phone_number", unique = true),
        @Index(name = "idx_customer_email", columnList = "email")
    }
)
public class CustomerProfile extends BaseEntity {

    @Column(name = "phone_number", nullable = false, length = 20, unique = true)
    private String phoneNumber; // Required for SMS routing

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "email", length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loyalty_tier_id")
    private LoyaltyTier loyaltyTier;

    @Column(name = "lifetime_spend", nullable = false, precision = 12, scale = 2)
    private BigDecimal lifetimeSpend = BigDecimal.ZERO;

    @Column(name = "available_points", nullable = false)
    private int availablePoints = 0;

    @Column(name = "preference_notes", columnDefinition = "text")
    private String preferenceNotes;

    @Column(name = "visit_count", nullable = false)
    private int visitCount = 0;

    @Column(name = "sms_opt_in", nullable = false)
    private boolean smsOptIn = true;

    @Column(name = "email_opt_in", nullable = false)
    private boolean emailOptIn = true;

    @Column(name = "last_visit_at")
    private Instant lastVisitAt;

    @Column(name = "is_churned", nullable = false)
    private boolean isChurned = false;

    @OneToMany(mappedBy = "customerProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CustomerDietaryTag> dietaryTags = new ArrayList<>();

    @OneToMany(mappedBy = "customerProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CustomerOccasion> occasions = new ArrayList<>();

    // --- Getters and Setters ---
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LoyaltyTier getLoyaltyTier() { return loyaltyTier; }
    public void setLoyaltyTier(LoyaltyTier loyaltyTier) { this.loyaltyTier = loyaltyTier; }
    public BigDecimal getLifetimeSpend() { return lifetimeSpend; }
    public void setLifetimeSpend(BigDecimal lifetimeSpend) { this.lifetimeSpend = lifetimeSpend; }
    public int getAvailablePoints() { return availablePoints; }
    public void setAvailablePoints(int availablePoints) { this.availablePoints = availablePoints; }
    public String getPreferenceNotes() { return preferenceNotes; }
    public void setPreferenceNotes(String preferenceNotes) { this.preferenceNotes = preferenceNotes; }
    public int getVisitCount() { return visitCount; }
    public void setVisitCount(int visitCount) { this.visitCount = visitCount; }
    public boolean isSmsOptIn() { return smsOptIn; }
    public void setSmsOptIn(boolean smsOptIn) { this.smsOptIn = smsOptIn; }
    public boolean isEmailOptIn() { return emailOptIn; }
    public void setEmailOptIn(boolean emailOptIn) { this.emailOptIn = emailOptIn; }
    public Instant getLastVisitAt() { return lastVisitAt; }
    public void setLastVisitAt(Instant lastVisitAt) { this.lastVisitAt = lastVisitAt; }
    public boolean isChurned() { return isChurned; }
    public void setChurned(boolean churned) { isChurned = churned; }
    public List<CustomerDietaryTag> getDietaryTags() { return dietaryTags; }
    public void setDietaryTags(List<CustomerDietaryTag> dietaryTags) { this.dietaryTags = dietaryTags; }
    public List<CustomerOccasion> getOccasions() { return occasions; }
    public void setOccasions(List<CustomerOccasion> occasions) { this.occasions = occasions; }
}
