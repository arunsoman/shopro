package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "bid_item")
@Getter
@Setter
public class BidItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_invitation_id", nullable = false)
    private BidInvitation bidInvitation;

    @Column(name = "product_name")
    private String productName;

    private BigDecimal quantity;

    private String unit;
}
