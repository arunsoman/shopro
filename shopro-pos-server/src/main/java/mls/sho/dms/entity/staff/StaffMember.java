package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a staff member who can log in to Shopro POS terminals.
 *
 * Security note: pinHash must store a bcrypt/argon2 hash — NEVER a plain-text PIN.
 *
 * Indexes:
 *   - UNIQUE on pin_hash per role group is not needed (PINs are globally unique per active staff).
 *   - idx_staff_active: partial index on (id) WHERE active = true — fast login lookups.
 */
@Entity
@Table(
    name = "staff_member",
    indexes = {
        @Index(name = "idx_staff_active", columnList = "active"),
        @Index(name = "idx_staff_role",   columnList = "role")
    }
)
public class StaffMember extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    /**
     * Stores bcrypt/argon2 hash of the 4-digit PIN. Never store plain text.
     * The application layer is responsible for hashing before persistence.
     */
    @Column(name = "pin_hash", nullable = false, length = 255)
    private String pinHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private StaffRole role;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    /** Timestamp of the most recent successful login, for session and audit purposes. */
    @Column(name = "last_login_at")
    private java.time.Instant lastLoginAt;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPinHash() { return pinHash; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }

    public StaffRole getRole() { return role; }
    public void setRole(StaffRole role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public java.time.Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(java.time.Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
