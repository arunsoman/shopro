package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.PurchaseCategory;
import java.math.BigDecimal;

/**
 * One category allocation line on an invoice.
 */
@Entity
@Table(name = "purchase_invoice_line",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"invoice_id", "purchase_category"}))
@Data
public class PurchaseInvoiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private PurchaseInvoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_category", nullable = false)
    private PurchaseCategory purchaseCategory;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
