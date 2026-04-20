package mls.sho.dms.entity.experiment;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.ExperimentStatus;
import mls.sho.dms.common.enums.ExperimentType;
import mls.sho.dms.common.enums.ManagerRole;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.experiment.config.ExecutionConfig;
import mls.sho.dms.entity.experiment.config.Hypothesis;
import mls.sho.dms.entity.experiment.config.RandomizationConfig;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "experiments")
@Data
public class Experiment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "experiment_key", unique = true, nullable = false)
    private String experimentKey;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperimentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperimentStatus status = ExperimentStatus.DRAFT;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Hypothesis hypothesis;

    @Type(JsonType.class)
    @Column(name = "randomization_config", columnDefinition = "jsonb", nullable = false)
    private RandomizationConfig randomizationConfig;

    @Type(JsonType.class)
    @Column(name = "execution_config", columnDefinition = "jsonb", nullable = false)
    private ExecutionConfig executionConfig;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_role", nullable = false)
    private ManagerRole ownerRole;

    @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("variantKey ASC")
    private List<ExperimentVariant> variants = new ArrayList<>();

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Version
    private Long version;

    public Optional<ExperimentVariant> getControlVariant() {
        return variants.stream().filter(ExperimentVariant::isControl).findFirst();
    }
}
