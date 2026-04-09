package mls.sho.dms.entity.inventory.recipe;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.dms.entity.management.ManagementProfile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "mgt_batch_recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ManagementProfile profile;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double yieldQuantity;

    @Column(nullable = false)
    private String yieldUnit; // Typically RU: GAL, LB, etc.

    @Column(columnDefinition = "TEXT")
    private String preparationInstructions;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RecipeIngredientLine> ingredients = new ArrayList<>();

    private Double laborMinutes;

    public Double calculateTotalIngredientCost() {
        return ingredients.stream()
                .mapToDouble(RecipeIngredientLine::calculateLineCost)
                .sum();
    }

    public Double calculateCostPerYieldUnit() {
        if (yieldQuantity == null || yieldQuantity == 0) return 0.0;
        return calculateTotalIngredientCost() / yieldQuantity;
    }
}
