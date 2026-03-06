package mls.sho.dms.entity.kds;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a physical or logical Kitchen Display System station.
 * Examples: Grill, Pantry, Bar, Fry Station, Expo.
 */
@Entity
@Table(
    name = "kds_station",
    indexes = {
        @Index(name = "uq_kds_station_name", columnList = "name", unique = true)
    }
)
public class KDSStation extends BaseEntity {

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "station_type", nullable = false, length = 30)
    private KDSStationType stationType;

    @Column(name = "online", nullable = false)
    private boolean online = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public KDSStationType getStationType() { return stationType; }
    public void setStationType(KDSStationType stationType) { this.stationType = stationType; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
}
