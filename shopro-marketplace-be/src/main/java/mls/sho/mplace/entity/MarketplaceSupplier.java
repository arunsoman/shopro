package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "marketplace_supplier")
@Getter
@Setter
public class MarketplaceSupplier extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(nullable = false)
    private boolean enabled = true;
}
