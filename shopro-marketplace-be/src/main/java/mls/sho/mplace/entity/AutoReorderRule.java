package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "auto_reorder_rule")
@Getter
@Setter
public class AutoReorderRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "min_threshold", precision = 19, scale = 4, nullable = false)
    private BigDecimal alert;

    @Column(name = "reorder_quantity", precision = 19, scale = 4, nullable = false)
    private BigDecimal reorderQuantity;

    @Column(name = "is_active")
    private boolean active = true;
}
