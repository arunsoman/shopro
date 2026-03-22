package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "restaurant_inventory")
@Getter
@Setter
public class RestaurantInventory extends BaseEntity {

    @Column(nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(precision = 19, scale = 4)
    private BigDecimal currentQuantity;

    @Column(precision = 19, scale = 4)
    private BigDecimal minimumThreshold;

    @Column(name = "last_updated")
    private java.time.LocalDateTime lastUpdated;

    public String getHealth() {
        if (currentQuantity == null || minimumThreshold == null) return "UNKNOWN";
        if (currentQuantity.compareTo(minimumThreshold) < 0) return "CRITICAL";
        if (currentQuantity.compareTo(minimumThreshold.multiply(new BigDecimal("1.5"))) < 0) return "WARNING";
        return "NOMINAL";
    }
}
