package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "supplier")
@Getter
@Setter
public class Supplier extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "business_details", columnDefinition = "TEXT")
    private String businessDetails;

    @Column(name = "bank_details", columnDefinition = "TEXT")
    private String bankDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus;

    private String category;

    @Column(name = "organization_id")
    private String organizationId;

    @Column(columnDefinition = "TEXT")
    private String regions;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    @Column(name = "kyc_vetted")
    private boolean kycVetted = false;

    @Column(name = "vetting_date")
    private java.time.LocalDateTime vettingDate;

    private Double rating = 0.0;

    @Column(precision = 19, scale = 4)
    private BigDecimal volume = BigDecimal.ZERO;

    @Column(name = "trust_score")
    private Integer trustScore = 0;

    @Column(name = "fulfillment_rate", precision = 5, scale = 2)
    private BigDecimal fulfillmentRate = BigDecimal.ZERO;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "country_iso_code", length = 2)
    private String countryIsoCode;


    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED, SUSPENDED
    }
}
