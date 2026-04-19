package mls.sho.dms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HACCP compliance logs for food safety and cooler monitoring.
 */
@Entity
@Table(name = "haccp_log")
public class HaccpLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "equipment_name", nullable = false)
    private String equipmentName; // Cooler 1, Walk-in, Prep Table 2

    @Column(name = "check_type", nullable = false)
    private String checkType; // TEMPERATURE, SANITIZER, PM_LINE_CHECK

    @Column(name = "reading_value", precision = 5, scale = 2)
    private BigDecimal readingValue; // Degrees or PPM

    @Column(name = "is_compliant", nullable = false)
    private boolean compliant = true;

    @Column(name = "corrective_action", length = 500)
    private String correctiveAction;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Manual Accessors
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public String getCheckType() { return checkType; }
    public void setCheckType(String checkType) { this.checkType = checkType; }
    public BigDecimal getReadingValue() { return readingValue; }
    public void setReadingValue(BigDecimal readingValue) { this.readingValue = readingValue; }
    public boolean isCompliant() { return compliant; }
    public void setCompliant(boolean compliant) { this.compliant = compliant; }
    public String getCorrectiveAction() { return correctiveAction; }
    public void setCorrectiveAction(String correctiveAction) { this.correctiveAction = correctiveAction; }
    public UUID getStaffId() { return staffId; }
    public void setStaffId(UUID staffId) { this.staffId = staffId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
