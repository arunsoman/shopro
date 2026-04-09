package mls.sho.dms.entity.kds;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItem;

import java.util.UUID;

/**
 * Defines which KDS station receives items from a given Menu Category or specific MenuItem.
 * targetType = CATEGORY → targetId references a MenuCategory.id
 * targetType = ITEM     → targetId references a MenuItem.id
 *
 * This flexible design avoids complex polymorphism while supporting both routing modes.
 */
@Entity
@Table(
    name = "kds_routing_rule",
    indexes = {
        @Index(name = "idx_routing_station",     columnList = "station_id"),
        @Index(name = "idx_routing_target",      columnList = "target_type, target_id"),
        @Index(name = "uq_routing_station_target", columnList = "station_id, target_type, target_id", unique = true)
    }
)
public class KDSRoutingRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private KDSStation station;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private RoutingTargetType targetType;

    /** UUID referencing either a MenuCategory.id or MenuItem.id depending on targetType. */
    @Column(name = "target_id", nullable = false, columnDefinition = "uuid")
    private UUID targetId;

    public KDSStation getStation() { return station; }
    public void setStation(KDSStation station) { this.station = station; }
    public RoutingTargetType getTargetType() { return targetType; }
    public void setTargetType(RoutingTargetType targetType) { this.targetType = targetType; }
    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }
}
