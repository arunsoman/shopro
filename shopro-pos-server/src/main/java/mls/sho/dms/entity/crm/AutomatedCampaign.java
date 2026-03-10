package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "automated_campaign")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomatedCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TriggerEvent triggerEvent;

    @Column(nullable = false)
    @Builder.Default
    private int delayHours = 0;

    private UUID templateId;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
