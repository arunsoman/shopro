package mls.sho.dms.entity.experiment;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.VariantStatus;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "experiment_variants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"experiment_id", "variant_key"}))
@Data
public class ExperimentVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @Column(name = "variant_key", nullable = false)
    private String variantKey; // 'control', 'treatment'

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal allocation;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config;

    @Column(name = "is_control")
    private boolean control = false;

    @Enumerated(EnumType.STRING)
    private VariantStatus status = VariantStatus.ACTIVE;
}
