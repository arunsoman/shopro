package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Entity representing an item in a restaurant's inventory.
 * Links a Restaurant to a Food item from the catalog.
 */
@Entity
@Table(name = "inventory_item", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"restaurant_id", "food_id"})
})
@Getter
@Setter
public class InventoryItem extends BaseEntity {

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @Column(nullable = false)
    private Double quantity = 0.0;

    @Column(length = 20)
    private String unit = "unit";

    @Column(name = "lead_time")
    private Integer leadTime = 3;

    @Column(name = "alert_level")
    private Double alertLevel = 10.0;

    @Column(name = "reorder_count")
    private Double reorderCount = 50.0;

    @Column(length = 20)
    private String status = "AVAILABLE";
}
