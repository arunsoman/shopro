package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Audit ledger for every stock movement, acting as the event log for inventory state.
 * All reads of current stock should use RawIngredient.currentStock. This table is the
 * immutable history used for usage charts, waste reports, and cost auditing.
 *
 * PostgreSQL strategy:
 *   - PARTITIONED BY RANGE (transacted_at) with monthly child tables.
 *     DDL: CREATE TABLE inventory_transaction PARTITION BY RANGE (transacted_at);
 *   - BRIN index on transacted_at within each partition.
 *   - GIN index on metadata JSONB for flexible querying (e.g., find all depletions for order X).
 *   - referenceId: stores the UUID of the triggering entity (OrderItem, PurchaseOrder, PhysicalCount).
 */
@Entity
@Table(
    name = "inventory_transaction",
    indexes = {
        @Index(name = "idx_inv_tx_ingredient_time", columnList = "ingredient_id, transacted_at"),
        @Index(name = "idx_inv_tx_type_time",       columnList = "transaction_type, transacted_at"),
        @Index(name = "idx_inv_tx_time_brin",       columnList = "transacted_at") // Use BRIN in DDL
    }
)
public class InventoryTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private InventoryTransactionType transactionType;

    /** Positive = stock added (RESTOCK, OPENING_STOCK). Negative = stock removed (DEPLETION, WASTE). */
    @Column(name = "quantity_delta", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityDelta;

    /** Unit cost at the time of the transaction. Nullable for non-restock types. */
    @Column(name = "unit_cost_at_time", precision = 10, scale = 4)
    private BigDecimal unitCostAtTime;

    /** Human-readable reason for MANUAL_ADJUSTMENT or WASTE entries. */
    @Column(name = "reason", length = 256)
    private String reason;

    /** UUID of the triggering entity (OrderItem.id, PurchaseOrderLine.id, PhysicalCount.id). */
    @Column(name = "reference_id", columnDefinition = "uuid")
    private UUID referenceId;

    /** JSONB flexible metadata (e.g., recipe version used, session info). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private StaffMember createdBy;

    @Column(name = "transacted_at", nullable = false)
    private Instant transactedAt;

    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public InventoryTransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(InventoryTransactionType t) { this.transactionType = t; }
    public BigDecimal getQuantityDelta() { return quantityDelta; }
    public void setQuantityDelta(BigDecimal q) { this.quantityDelta = q; }
    public BigDecimal getUnitCostAtTime() { return unitCostAtTime; }
    public void setUnitCostAtTime(BigDecimal u) { this.unitCostAtTime = u; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public UUID getReferenceId() { return referenceId; }
    public void setReferenceId(UUID referenceId) { this.referenceId = referenceId; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public StaffMember getCreatedBy() { return createdBy; }
    public void setCreatedBy(StaffMember createdBy) { this.createdBy = createdBy; }
    public Instant getTransactedAt() { return transactedAt; }
    public void setTransactedAt(Instant transactedAt) { this.transactedAt = transactedAt; }
}
