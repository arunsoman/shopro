package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "supplier_performance_sla")
@Getter
@Setter
public class SupplierPerformanceSLA extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "on_time_delivery_rate")
    private double onTimeDeliveryRate = 1.0;

    @Column(name = "quality_score")
    private double qualityScore = 1.0;

    @Column(name = "bid_participation_rate")
    private double bidParticipationRate = 0.0;

    @Column(name = "visibility_multiplier")
    private double visibilityMultiplier = 1.0;
}
