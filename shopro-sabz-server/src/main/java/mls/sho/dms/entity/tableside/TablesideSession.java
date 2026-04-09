package mls.sho.dms.entity.tableside;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.floor.TableShape;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents an active mobile ordering session tied to a table via QR code.
 *
 * PostgreSQL strategy:
 *   - UNIQUE on qr_token: each scan resolves to exactly one session.
 *   - Partial index WHERE status = 'ACTIVE': the mobile web app only ever
 *     queries active sessions — this keeps the hot index tiny.
 *   - A new session (with a fresh qr_token UUID) is created every time a table
 *     transitions from DIRTY → AVAILABLE (marked clean), invalidating all prior QR codes.
 */
@Entity
@Table(
    name = "tableside_session",
    indexes = {
        @Index(name = "uq_session_qr_token",   columnList = "qr_token", unique = true),
        @Index(name = "idx_session_table_active", columnList = "table_id, status") // Use partial in DDL
    }
)
public class TablesideSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id", nullable = false)
    private TableShape table;

    /** UUID embedded in the QR code URL. Regenerated on each table clean-mark. */
    @Column(name = "qr_token", nullable = false, columnDefinition = "uuid")
    private UUID qrToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TablesideSessionStatus status = TablesideSessionStatus.ACTIVE;

    /** When the session was automatically or manually expired. */
    @Column(name = "expires_at")
    private Instant expiresAt;

    public TableShape getTable() { return table; }
    public void setTable(TableShape table) { this.table = table; }
    public UUID getQrToken() { return qrToken; }
    public void setQrToken(UUID qrToken) { this.qrToken = qrToken; }
    public TablesideSessionStatus getStatus() { return status; }
    public void setStatus(TablesideSessionStatus status) { this.status = status; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
