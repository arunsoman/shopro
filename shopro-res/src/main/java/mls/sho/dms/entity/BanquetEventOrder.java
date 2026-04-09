package mls.sho.dms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Banquet Event Order (BEO) for catering and large party management.
 */
@Entity
@Table(name = "banquet_event_order")
public class BanquetEventOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "event_type", nullable = false)
    private String eventType; // WEDDING, CORPORATE, SOCIAL

    @Column(name = "guaranteed_count", nullable = false)
    private Integer guaranteedCount;

    @Column(name = "actual_count")
    private Integer actualCount;

    @Column(name = "event_start", nullable = false)
    private LocalDateTime eventStart;

    @Column(name = "event_end")
    private LocalDateTime eventEnd;

    @Column(name = "location")
    private String location; // IN_HOUSE, OFF_SITE

    @Column(name = "total_revenue", precision = 12, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "total_cost", precision = 12, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "equipment_notes", length = 1000)
    private String equipmentNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatus status = EventStatus.PROPOSAL;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EventStatus { PROPOSAL, CONFIRMED, FINALIZED, COMPLETED, CANCELLED }

    // Manual Accessors
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Integer getGuaranteedCount() { return guaranteedCount; }
    public void setGuaranteedCount(Integer guaranteedCount) { this.guaranteedCount = guaranteedCount; }
    public Integer getActualCount() { return actualCount; }
    public void setActualCount(Integer actualCount) { this.actualCount = actualCount; }
    public LocalDateTime getEventStart() { return eventStart; }
    public void setEventStart(LocalDateTime eventStart) { this.eventStart = eventStart; }
    public LocalDateTime getEventEnd() { return eventEnd; }
    public void setEventEnd(LocalDateTime eventEnd) { this.eventEnd = eventEnd; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public String getEquipmentNotes() { return equipmentNotes; }
    public void setEquipmentNotes(String equipmentNotes) { this.equipmentNotes = equipmentNotes; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
