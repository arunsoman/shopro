package mls.sho.dms.application.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.common.enums.*;
import mls.sho.dms.entity.Restaurant;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Master catalogue entry for one purchasable ingredient.
 */
@Entity
@Table(name = "ingredient",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "item_code"}))
@Getter
@Setter
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @Column(name = "item_code", nullable = false, length = 6)
    private String itemCode;

    @Column(nullable = false)
    private String description;

    // -- Classification ----------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_type", nullable = false)
    private InventoryType inventoryType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryCategory category;

    // -- Purchase unit -----------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_unit", nullable = false)
    private PurchaseUnit purchaseUnit;

    @Column(name = "case_pack_size")
    private String casePackSize;

    @Column(name = "purchase_unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal purchaseUnitPrice;

    // -- Recipe unit -------------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_unit", nullable = false)
    private RecipeUnit recipeUnit;

    @Column(name = "ru_per_pu", nullable = false, precision = 10, scale = 4)
    private BigDecimal ruPerPu;

    @Column(name = "yield_pct", nullable = false, precision = 6, scale = 4)
    private BigDecimal yieldPct;

    // -- Inventory unit ----------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_unit", nullable = false)
    private InventoryUnit inventoryUnit;

    @Column(name = "iu_per_pu", nullable = false, precision = 10, scale = 4)
    private BigDecimal iuPerPu;

    // -- Density (volume ↔ weight conversion) ------------------
    @Column(name = "oz_weight_per_cup", precision = 8, scale = 4)
    private BigDecimal ozWeightPerCup;

    @Enumerated(EnumType.STRING)
    @Column(name = "packed_by")
    private PackedBy packedBy;

    // -- Par level ---------------------------------------------
    @Column(name = "par_level", precision = 10, scale = 3)
    private BigDecimal parLevel;

    /**
     * @deprecated Use {@link InventoryIngredientBalance#getCurrentBalance()}
     *             as the authoritative stock-on-hand balance.
     *             This column is kept for backward reference only and is no longer written
     *             by the application. It will be dropped in a future migration.
     */
    @Deprecated
    @Column(name = "on_hand", precision = 10, scale = 3, insertable = false, updatable = false)
    private BigDecimal onHand = BigDecimal.ZERO;

    // -- Image -------------------------------------------------
    @Column(name = "image_storage_key")
    private String imageStorageKey;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
