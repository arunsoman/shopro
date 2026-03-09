package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Time-limited bonus point events (e.g., "2x Points on Tuesdays").
 */
@Entity
@Table(
    name = "bonus_point_event",
    indexes = {
        @Index(name = "idx_bonus_event_active", columnList = "is_active, starts_at, ends_at")
    }
)
public class BonusPointEvent extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** Points multiplier (e.g., 2.0 for double points) */
    @Column(name = "multiplier", nullable = false, precision = 3, scale = 1)
    private BigDecimal multiplier = new BigDecimal("2.0");

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 20)
    private BonusPointEventScope scope = BonusPointEventScope.ALL;

    /** FK to MenuCategory or MenuItem depending on scope; null when scope=ALL */
    @Column(name = "scope_reference_id")
    private UUID scopeReferenceId;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getMultiplier() { return multiplier; }
    public void setMultiplier(BigDecimal multiplier) { this.multiplier = multiplier; }
    public BonusPointEventScope getScope() { return scope; }
    public void setScope(BonusPointEventScope scope) { this.scope = scope; }
    public UUID getScopeReferenceId() { return scopeReferenceId; }
    public void setScopeReferenceId(UUID scopeReferenceId) { this.scopeReferenceId = scopeReferenceId; }
    public Instant getStartsAt() { return startsAt; }
    public void setStartsAt(Instant startsAt) { this.startsAt = startsAt; }
    public Instant getEndsAt() { return endsAt; }
    public void setEndsAt(Instant endsAt) { this.endsAt = endsAt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
