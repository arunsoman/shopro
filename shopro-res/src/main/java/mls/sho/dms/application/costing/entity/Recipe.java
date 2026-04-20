package mls.sho.dms.application.costing.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.common.enums.KitchenStationType;
import mls.sho.dms.common.enums.RecipeType;
import mls.sho.dms.common.enums.RecipeUnit;
import mls.sho.dms.common.enums.ShelfLife;
import mls.sho.dms.entity.Restaurant;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Unified Recipe entity for both Menu Items (PLATE) and Prep Batches (BATCH).
 */
@Entity
@Table(name = "recipe",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name", "menu_item_id"}))
@Data
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    /**
     * Link to the sellable menu item. 
     * Null if this is a standalone Batch Recipe (e.g. "Korma Base").
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_type", nullable = false)
    private RecipeType recipeType = RecipeType.PLATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "station", nullable = false)
    private KitchenStationType station;

    @Enumerated(EnumType.STRING)
    @Column(name = "shelf_life")
    private ShelfLife shelfLife;

    @Column(name = "tools_equipment", length = 500)
    private String toolsEquipment;

    @Column(name = "position_notes", length = 500)
    private String positionNotes;

    /** For Batch recipes, how much does this recipe produce (e.g., 5 Liters). */
    @Column(name = "yield_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal yieldQuantity = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "yield_unit")
    private RecipeUnit yieldUnit = RecipeUnit.EACH;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OrderBy("lineNumber ASC")
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredientLine> ingredientLines = new ArrayList<>();

    @OrderBy("stepNumber ASC")
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeProcedureStep> procedureSteps = new ArrayList<>();

    @Override
    public int hashCode() {
        return Objects.hash(id); // only use ID, not recipes
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Recipe other)) return false;
        return Objects.equals(id, other.id);
    }
}
