package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "quote")
@Getter
@Setter
public class Quote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_invitation_id", nullable = false)
    private BidInvitation bidInvitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "total_amount", precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private QuoteStatus status = QuoteStatus.SUBMITTED;

    public enum QuoteStatus {
        SUBMITTED,
        ACCEPTED,
        REJECTED
    }
}
