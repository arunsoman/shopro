package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "compliance_document")
@Getter
@Setter
public class ComplianceDocument extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.PENDING;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "document_url")
    private String documentUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    public enum DocumentStatus {
        PENDING,
        UNDER_REVIEW,
        PENDING_REVIEW,
        APPROVED,
        REJECTED,
        EXPIRED
    }

    public void setRestaurantId(java.util.UUID restaurantId) {
        this.restaurant = new Restaurant();
        this.restaurant.setId(restaurantId);
    }

    public void setSupplierId(java.util.UUID supplierId) {
        this.supplier = new Supplier();
        this.supplier.setId(supplierId);
    }
}
