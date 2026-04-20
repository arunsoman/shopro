package mls.sho.dms.application.pos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.costing.entity.MenuCostGroup;
import mls.sho.dms.application.costing.entity.Recipe;
import mls.sho.dms.entity.Restaurant;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * A sellable menu item.
 */
@Entity
@Table(name = "menu_item",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "pos_id"}))
@Data
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private MenuCostGroup group;

    @Column(name = "pos_id", nullable = false)
    private String posId;

    @Column(nullable = false)
    private String name;

    @Column(name = "sell_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellPriceBuffer; // Buffer for logic

    @Column(name = "target_fc_pct", precision = 6, scale = 4)
    private BigDecimal targetFoodCostPct;

    @Column(name = "plate_cost", precision = 12, scale = 2)
    private BigDecimal plateCost;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes = 10; // Default 10m

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<Recipe> recipes = new java.util.HashSet<>();

    @Override
    public int hashCode() {
        return Objects.hash(id); // only use ID, not recipes
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MenuItem other)) return false;
        return Objects.equals(id, other.id);
    }
}
