package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "seasonality_rule")
@Getter
@Setter
public class SeasonalityRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "start_month")
    private int startMonth; // 1-12

    @Column(name = "end_month")
    private int endMonth; // 1-12

    @Column(name = "price_multiplier", precision = 5, scale = 2)
    private BigDecimal priceMultiplier = BigDecimal.ONE;

    @Column(name = "availability_probability")
    private double availabilityProbability = 1.0;
}
