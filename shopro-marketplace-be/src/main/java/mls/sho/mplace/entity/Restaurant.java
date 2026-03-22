package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "restaurant")
@Getter
@Setter
public class Restaurant extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_info", columnDefinition = "TEXT")
    private String contactInfo;

    private String category;

    @Column(precision = 19, scale = 4)
    private BigDecimal volume = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_status")
    private OnboardingStatus onboardingStatus = OnboardingStatus.PENDING;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    @Column(name = "kyc_vetted")
    private boolean kycVetted = false;

    @Column(name = "vetting_date")
    private java.time.LocalDateTime vettingDate;

    private Double rating = 0.0;

    @Column(name = "performance_metrics", columnDefinition = "JSONB")
    private String performanceMetrics;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "trust_score")
    private Integer trustScore = 0;

    private String city;

    @Column(name = "members_count")
    private Integer membersCount = 0;

    @Column(name = "image_url")
    private String imageUrl;

    public enum VerificationStatus {
        PENDING, ACTIVE, SUSPENDED, REJECTED
    }

    public enum OnboardingStatus {
        PENDING, IN_PROGRESS, COMPLETED, REJECTED
    }
}
