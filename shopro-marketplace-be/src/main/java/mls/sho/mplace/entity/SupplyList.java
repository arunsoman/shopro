package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Entity representing a supplier's personal supply list.
 * Data is copied from the master Food catalog upon addition.
 */
@Entity
@Table(name = "supply_list", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"supplier_id", "food_id"})
})
@Getter
@Setter
public class SupplyList extends BaseEntity {

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "food_id", nullable = false)
    private Integer foodId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "offer_count")
    private Integer offerCount = 0;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "stock_qty")
    private Double stockQty = 0.0;

    @Column(name = "auto_response_mode")
    private Boolean autoResponseMode = false;
}
