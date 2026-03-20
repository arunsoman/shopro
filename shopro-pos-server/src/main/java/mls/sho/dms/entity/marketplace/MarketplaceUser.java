package mls.sho.dms.entity.marketplace;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "marketplace_user")
@Getter
@Setter
@NoArgsConstructor
public class MarketplaceUser extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MarketplaceRole role;

    @Column(name = "associated_entity_id")
    private UUID associatedEntityId;
}
