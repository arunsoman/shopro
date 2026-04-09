package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * Immutable audit record for every sensitive action in the system.
 *
 * PostgreSQL strategy:
 *   - PARTITIONED BY RANGE (occurred_at) with monthly child tables.
 *     Example DDL: CREATE TABLE audit_log PARTITION BY RANGE (occurred_at);
 *     Child:       CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
 *                      FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
 *   - BRIN index on occurred_at (monotonically increasing, very cheap on large partitions).
 *   - GIN index on before_state/after_state for full JSONB search.
 *
 * Records are never updated or deleted — append-only.
 */
@Entity
@Table(
    name = "audit_log",
    indexes = {
        @Index(name = "idx_audit_actor",   columnList = "actor_id"),
        @Index(name = "idx_audit_entity",  columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_time_brin", columnList = "occurred_at") // Use BRIN in DDL
    }
)
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private StaffMember actor;

    @Column(name = "action", nullable = false, length = 80)
    private String action; // e.g. "VOID_ITEM", "APPLY_DISCOUNT", "MANAGER_OVERRIDE"

    @Column(name = "entity_type", nullable = false, length = 60)
    private String entityType; // e.g. "OrderItem", "StaffMember"

    @Column(name = "entity_id", nullable = false, columnDefinition = "uuid")
    private java.util.UUID entityId;

    /** JSON snapshot of the entity state BEFORE the action. Nullable for CREATE actions. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", columnDefinition = "jsonb")
    private Map<String, Object> beforeState;

    /** JSON snapshot of the entity state AFTER the action. Nullable for DELETE actions. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", columnDefinition = "jsonb")
    private Map<String, Object> afterState;

    @Column(name = "occurred_at", nullable = false)
    private java.time.Instant occurredAt;

    public StaffMember getActor() { return actor; }
    public void setActor(StaffMember actor) { this.actor = actor; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public java.util.UUID getEntityId() { return entityId; }
    public void setEntityId(java.util.UUID entityId) { this.entityId = entityId; }

    public Map<String, Object> getBeforeState() { return beforeState; }
    public void setBeforeState(Map<String, Object> beforeState) { this.beforeState = beforeState; }

    public Map<String, Object> getAfterState() { return afterState; }
    public void setAfterState(Map<String, Object> afterState) { this.afterState = afterState; }

    public java.time.Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(java.time.Instant occurredAt) { this.occurredAt = occurredAt; }
}
