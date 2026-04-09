package mls.sho.dms.entity.inventory.vendor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.inventory.ingredient.RawIngredient;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "vendor_price_proposal")
@Getter
@Setter
public class VendorPriceProposal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "proposed_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal proposedPrice;

    @Column(name = "proposed_quantity", precision = 12, scale = 4)
    private BigDecimal proposedQuantity;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorPriceProposalStatus status = VendorPriceProposalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private StaffMember reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private SupplierUser submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_po_id")
    private PurchaseOrder generatedPo;
}
