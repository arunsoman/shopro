package mls.sho.dms.application.engineering.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "experiment_metrics")
@Data
public class ExperimentMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ExperimentVariant variant;

    @Column(name = "metric_date", nullable = false)
    private LocalDate metricDate;

    @Column(name = "metric_type", nullable = false)
    private String metricType; // 'WASTE_VAL', 'TICKET_TIME'

    @Column(name = "metric_value", nullable = false, precision = 15, scale = 4)
    private BigDecimal metricValue;

    @Column(name = "sample_size")
    private Integer sampleSize = 1;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> dimensions;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
