package mls.sho.dms.application.costing.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * One step in the preparation procedure of a batch recipe.
 */
@Entity
@Table(name = "recipe_procedure_step")
@Data
public class RecipeProcedureStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instruction;

    @Column(name = "is_critical_control_point", nullable = false)
    private boolean criticalControlPoint = false;
}
