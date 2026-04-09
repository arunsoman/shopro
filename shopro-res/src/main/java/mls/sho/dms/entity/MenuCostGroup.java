package mls.sho.dms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * A grouping for menu items (e.g. "Main Courses", "Starters").
 */
@Entity
@Table(name = "menu_cost_group",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name"}))
@Data
public class MenuCostGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "target_food_cost_pct", precision = 5, scale = 2)
    private java.math.BigDecimal targetFoodCostPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
