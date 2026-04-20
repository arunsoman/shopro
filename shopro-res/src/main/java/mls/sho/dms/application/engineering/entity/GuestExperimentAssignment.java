package mls.sho.dms.entity.experiment;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.users.Guest;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guest_experiment_assignments", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"guest_id", "experiment_id"}))
@Data
public class GuestExperimentAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @Column(name = "fallback_session_id")
    private Long fallbackSessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ExperimentVariant variant;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();
}
