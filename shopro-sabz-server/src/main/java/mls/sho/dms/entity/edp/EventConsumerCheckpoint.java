package mls.sho.dms.entity.edp;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "event_consumer_checkpoint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventConsumerCheckpoint {

    @Id
    @Column(name = "consumer_id", length = 100)
    private String consumerId;

    @Column(name = "last_processed_event_id", nullable = false)
    private Long lastProcessedEventId;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
