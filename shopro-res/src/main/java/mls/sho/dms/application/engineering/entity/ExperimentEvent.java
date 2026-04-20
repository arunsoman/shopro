package mls.sho.dms.application.engineering.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "experiment_events")
@Data
public class ExperimentEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @Column(name = "event_type", nullable = false)
    private String eventType; // 'VARIANT_SWITCH', 'GUARDRAIL_BREACH', 'AUTO_ROLLBACK'

    @Type(JsonType.class)
    @Column(name = "event_data", columnDefinition = "jsonb")
    private Map<String, Object> eventData;

    @Column(name = "triggered_by")
    private String triggeredBy; // 'SYSTEM', 'USER:uuid'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
