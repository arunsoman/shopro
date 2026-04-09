package mls.sho.dms.application.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.entity.Restaurant;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a physical inventory count period for a restaurant.
 */
@Entity
@Table(name = "physical_inventory_period",
       indexes = @Index(name = "idx_pip_restaurant", columnList = "restaurant_id"))
@Data
public class PhysicalInventoryPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_type", nullable = false)
    private InventoryType inventoryType;

    @Column(name = "period_name", nullable = false)
    private String periodName;

    @Column(name = "count_date", nullable = false)
    private LocalDate countDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PeriodStatus status = PeriodStatus.OPEN;

    @OneToMany(mappedBy = "period", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PhysicalInventoryLine> lines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "finalised_at")
    private LocalDateTime finalisedAt;

    public enum PeriodStatus { OPEN, FINALISED }
}
