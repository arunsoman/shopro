package mls.sho.dms.application.costing.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.pos.entity.MenuItem;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A visual "Build Chart" for assembly instruction.
 */
@Entity
@Table(name = "recipe_build_chart")
@Data
public class RecipeBuildChart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "assembly_notes", length = 1000)
    private String assemblyNotes;

    @Column(name = "final_presentation_image_key")
    private String finalPresentationImageKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "buildChart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BuildChartLine> lines = new ArrayList<>();
}
