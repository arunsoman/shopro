package mls.sho.dms.entity.staff;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.time.Instant;

/**
 * Persists a cryptographic binding between a staff member and a specific device hardware.
 * Part of the FAPI 2.0 / DPoP implementation.
 */
@Entity
@Table(name = "staff_device_bindings", indexes = {
    @Index(name = "idx_device_public_key", columnList = "public_key_thumbprint")
})
public class DeviceBinding extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private StaffMember staffMember;

    /**
     * JWK Thumbprint or raw public key string used for DPoP verification.
     */
    @Column(name = "public_key_thumbprint", nullable = false, length = 512)
    private String publicKeyThumbprint;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "last_active_at")
    private Instant lastActiveAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    public StaffMember getStaffMember() { return staffMember; }
    public void setStaffMember(StaffMember staffMember) { this.staffMember = staffMember; }

    public String getPublicKeyThumbprint() { return publicKeyThumbprint; }
    public void setPublicKeyThumbprint(String publicKeyThumbprint) { this.publicKeyThumbprint = publicKeyThumbprint; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
