package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_order")
@Getter
@Setter
public class PurchaseOrder extends BaseEntity {

    @Column(name = "reference_number", unique = true, nullable = false)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    public java.util.UUID getRestaurantId() {
        return restaurant != null ? restaurant.getId() : null;
    }

    @Column(name = "total_amount", precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private POStatus status = POStatus.RAISED;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "approval_required")
    private boolean approvalRequired = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    private ApprovalStatus approvalStatus = ApprovalStatus.NOT_REQUIRED;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "total_tax", precision = 19, scale = 4)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "total_discount", precision = 19, scale = 4)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "created_by_principal_id")
    private String createdByPrincipalId;

    @Enumerated(EnumType.STRING)
    private POSource source = POSource.MANUAL;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL)
    private List<SubOrder> subOrders = new ArrayList<>();

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    public enum POStatus {
        RAISED,
        PENDING_APPROVAL,
        SHIPPED,    
        DELIVERED,
        CLARIFICATION_REQUESTED,
        ACCEPTED,
        SPLITTING,
        SPLIT_COMPLETE,
        IN_FULFILLMENT,
        COMPLETED,
        CANCELLED
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        NOT_REQUIRED
    }

    public enum POSource {
        MANUAL,
        AUTO
    }
}
