package mls.sho.dms.entity.marketplace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "masked_identity")
@Getter
@Setter
@NoArgsConstructor
public class MaskedIdentity extends BaseEntity {

    @Column(name = "internal_id", nullable = false, unique = true)
    private UUID internalId;

    @Column(name = "masked_id", nullable = false, unique = true, length = 20)
    private String maskedId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IdentityCategory category;

    public enum IdentityCategory {
        BUYER, SELLER, ORDER
    }
}
