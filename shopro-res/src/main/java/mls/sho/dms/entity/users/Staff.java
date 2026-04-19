package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "staff")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "staff_id")
    private UUID staffId;
    
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    
    @Column(name = "display_name", nullable = false)
    private String displayName;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StaffRole role;
    
    @Column(name = "pin_hash", nullable = false)
    private String pinHash;
    
    @Builder.Default
    @Column(name = "pin_length", nullable = false)
    private Integer pinLength = 4;
    
    @Builder.Default
    @Column(name = "can_take_orders")
    private Boolean canTakeOrders = false;
    
    @Builder.Default
    @Column(name = "can_process_payments")
    private Boolean canProcessPayments = false;
    
    @Builder.Default
    @Column(name = "can_manage_tables")
    private Boolean canManageTables = false;
    
    @Builder.Default
    @Column(name = "can_view_reports")
    private Boolean canViewReports = false;
    
    @Column(name = "device_fingerprint")
    private String deviceFingerprint;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "last_login_ip")
    private String lastLoginIp;
    
    @Builder.Default
    @Column(name = "failed_pin_attempts")
    private Integer failedPinAttempts = 0;
    
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Builder.Default
    @Column(name = "shift_active")
    private Boolean shiftActive = false;

    @Column(name = "hourly_rate", precision = 12, scale = 2)
    private BigDecimal hourlyRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type")
    private EmployeeType employeeType; // MANAGEMENT or HOURLY

    @Column(name = "annual_salary", precision = 12, scale = 2)
    private BigDecimal annualSalary; // null for hourly staff

    @Column(name = "termination_date")
    private LocalDateTime terminationDate;

    public enum EmployeeType {
        MANAGEMENT, HOURLY
    }
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }
    
    public List<String> getPermissions() {
        List<String> perms = new ArrayList<>();
        if (Boolean.TRUE.equals(canTakeOrders)) perms.add("TAKE_ORDERS");
        if (Boolean.TRUE.equals(canProcessPayments)) perms.add("PROCESS_PAYMENTS");
        if (Boolean.TRUE.equals(canManageTables)) perms.add("MANAGE_TABLES");
        if (Boolean.TRUE.equals(canViewReports)) perms.add("VIEW_REPORTS");
        return perms;
    }
}