package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_transaction")
@Getter
@Setter
public class FinancialTransaction extends BaseEntity {

    @Column(nullable = false)
    private String description;

    @Column(name = "restaurant_id", insertable = false, updatable = false)
    private java.util.UUID restaurantId;

    @Column(name = "transaction_date")
    private java.time.LocalDateTime transactionDate;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id")
    private SubOrder subOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    public enum TransactionStatus {
        PENDING,
        CAPTURED,
        DISBURSED,
        REFUNDED,
        FAILED,
        COMPLETED
    }

    public enum TransactionType {
        PAYMENT,
        PAYOUT,
        FEE,
        REBATE,
        COMMISSION
    }
}
