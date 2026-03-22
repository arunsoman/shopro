package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bid_invitation")
@Getter
@Setter
public class BidInvitation extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "restaurant_id")
    private java.util.UUID restaurantId;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    private BidStatus status = BidStatus.OPEN;

    @Column(nullable = false)
    private String urgency = "NORMAL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id")
    private SubOrder subOrder;

    @OneToMany(mappedBy = "bidInvitation", cascade = CascadeType.ALL)
    private List<BidItem> items = new ArrayList<>();

    public enum BidStatus {
        OPEN,
        CLOSED,
        AWARDED
    }
}
