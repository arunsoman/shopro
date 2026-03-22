package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "marketplace_buyer")
@Getter
@Setter
public class MarketplaceBuyer extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "restaurant_id")
    private UUID restaurantId;
    
    @Column(nullable = false)
    private boolean enabled = true;
}
