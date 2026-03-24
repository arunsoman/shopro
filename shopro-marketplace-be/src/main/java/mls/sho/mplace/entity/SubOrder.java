package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sub_order")
@Getter
@Setter
public class SubOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "total_amount", precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private SubOrderStatus status = SubOrderStatus.ACK_PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_mode")
    private AssignmentMode assignmentMode = AssignmentMode.DIRECT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_invitation_id")
    private BidInvitation bidInvitation;

    @Column(name = "estimated_delivery_date")
    private java.time.LocalDate estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private java.time.LocalDate actualDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status")
    private PayoutStatus payoutStatus = PayoutStatus.PENDING_DELIVERY;

    @Column(name = "payout_transaction_id")
    private String payoutTransactionId;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "markup_amount", precision = 19, scale = 4)
    private BigDecimal markupAmount = BigDecimal.ZERO;

    @Column(name = "routing_strategy")
    private String routingStrategy;

    public enum AssignmentMode {
        DIRECT,
        BID
    }

    public enum PayoutStatus {
        PENDING_DELIVERY,
        IN_QUEUE,
        INITIATED,
        PAID,
        HELD,
        FAILED
    }

    @OneToMany(mappedBy = "subOrder", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    public enum SubOrderStatus {
        ACK_PENDING,
        DISPATCHED,
        ROUTED,
        DISPATCHED_TO_SUPPLIER,
        ACKNOWLEDGED,
        PREPARING,
        SHIPPED,
        DELIVERED,
        PARTIALLY_DELIVERED,
        REJECTED,
        PAID
    }
}
