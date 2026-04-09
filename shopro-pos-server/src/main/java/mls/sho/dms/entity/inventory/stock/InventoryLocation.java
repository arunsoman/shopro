package mls.sho.dms.entity.inventory.stock;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.inventory.ingredient.StorageType;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_location",
    uniqueConstraints = {@UniqueConstraint(name = "uq_location_name", columnNames = {"name"})})
public class InventoryLocation extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false, length = 20)
    private StorageType storageType;

    @Column(name = "temperature_target", precision = 5, scale = 2)
    private BigDecimal temperatureTarget;

    @Column(name = "humidity_target", precision = 5, scale = 2)
    private BigDecimal humidityTarget;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public StorageType getStorageType() { return storageType; }
    public void setStorageType(StorageType storageType) { this.storageType = storageType; }
    public BigDecimal getTemperatureTarget() { return temperatureTarget; }
    public void setTemperatureTarget(BigDecimal temperatureTarget) { this.temperatureTarget = temperatureTarget; }
    public BigDecimal getHumidityTarget() { return humidityTarget; }
    public void setHumidityTarget(BigDecimal humidityTarget) { this.humidityTarget = humidityTarget; }
}
