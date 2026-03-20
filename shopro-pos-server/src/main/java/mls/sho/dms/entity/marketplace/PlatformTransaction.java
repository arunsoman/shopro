package mls.sho.dms.entity.marketplace;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "platform_transaction")
@Getter
@Setter
@NoArgsConstructor
public class PlatformTransaction extends BaseEntity {

    @Column(name = "po_id", nullable = false)
    private UUID poId;

    @Column(name = "total_captured_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal totalCapturedAmount = BigDecimal.ZERO;

    @Column(name = "supplier_payout_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal supplierPayoutAmount = BigDecimal.ZERO;

    @Column(name = "fee_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionStatus status = TransactionStatus.CAPTURED;

    public enum TransactionStatus {
        CAPTURED, ESCROW, DISBURSED, REFUNDED
    }
}
