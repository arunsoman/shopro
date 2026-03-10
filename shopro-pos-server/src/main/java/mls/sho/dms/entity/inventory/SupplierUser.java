package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;

/**
 * Represents an external user belonging to a Supplier organization.
 * Used for authentication in the Supplier Portal.
 */
@Entity
@Table(name = "supplier_user")
@Getter
@Setter
public class SupplierUser extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private SupplierRole role;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
