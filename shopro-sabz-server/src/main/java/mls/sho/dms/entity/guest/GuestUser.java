package mls.sho.dms.entity.guest;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * GuestUser represents a public user of the Sabz application.
 * Unlike StaffMember (internal), GuestUsers can log in via both 
 * traditional username/password and FAPI 2.0 / SSO flows.
 */
@Entity
@Table(
    name = "guest_users",
    indexes = {
        @Index(name = "idx_guest_email", columnList = "email"),
        @Index(name = "idx_guest_phone", columnList = "phone_number"),
        @Index(name = "idx_guest_sso", columnList = "sso_provider, sso_id")
    }
)
public class GuestUser extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    /** BCrypt/Argon2 hash of the user's password. Nullable for SSO-only accounts. */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    /** Identity provider identifier (e.g. 'google', 'auth0'). Nullable for manual-only accounts. */
    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    /** The 'sub' claim returned by the SSO provider. Nullable for manual-only accounts. */
    @Column(name = "sso_id", length = 255)
    private String ssoId;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    // --- Getters and Setters ---
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getSsoProvider() { return ssoProvider; }
    public void setSsoProvider(String ssoProvider) { this.ssoProvider = ssoProvider; }

    public String getSsoId() { return ssoId; }
    public void setSsoId(String ssoId) { this.ssoId = ssoId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
