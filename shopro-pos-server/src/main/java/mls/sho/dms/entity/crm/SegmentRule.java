package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "segment_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SegmentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id", nullable = false)
    private CustomerSegment segment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SegmentField field;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SegmentOperator operator;

    @Column(nullable = false)
    private String ruleValue;

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;
}
