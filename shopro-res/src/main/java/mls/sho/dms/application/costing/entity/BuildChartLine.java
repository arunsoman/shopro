package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * One line in a build chart, often with a step-specific image.
 */
@Entity
@Table(name = "build_chart_line")
@Data
public class BuildChartLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "build_chart_id", nullable = false)
    private RecipeBuildChart buildChart;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false)
    private String instruction;

    @Column(name = "step_image_key")
    private String stepImageKey;
}
