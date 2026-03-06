package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a physical POS terminal device.
 * Preferences (e.g., dark mode) persist per-device, not per-user.
 *
 * Indexes:
 *   - UNIQUE on device_name for human-readable terminal identification.
 */
@Entity
@Table(
    name = "pos_terminal",
    indexes = {
        @Index(name = "uq_terminal_name", columnList = "device_name", unique = true)
    }
)
public class POSTerminal extends BaseEntity {

    @Column(name = "device_name", nullable = false, length = 80)
    private String deviceName;

    /**
     * When true, the terminal renders in dark mode (default).
     * This is a device-level setting; not reset on user logout.
     */
    @Column(name = "dark_mode", nullable = false)
    private boolean darkMode = true;

    @Column(name = "last_active_at")
    private java.time.Instant lastActiveAt;

    /** The staff member currently logged in to this terminal. Nullable — null = locked/idle. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_staff_id")
    private StaffMember activeStaff;

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public java.time.Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(java.time.Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public StaffMember getActiveStaff() { return activeStaff; }
    public void setActiveStaff(StaffMember activeStaff) { this.activeStaff = activeStaff; }
}
