package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import java.time.LocalDateTime;

/**
 * Real-time punch-clock record for an employee.
 * Tracks individual 'Clock In' and 'Clock Out' events.
 */
@Entity
@Table(name = "employee_attendance",
       indexes = @Index(name = "idx_attend_active", columnList = "employee_id, status"))
@Data
public class EmployeeAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "clock_in_time", nullable = false)
    private LocalDateTime clockInTime;

    @Column(name = "clock_out_time")
    private LocalDateTime clockOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status = AttendanceStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AttendanceStatus {
        ACTIVE,
        COMPLETED,
        VOIDED
    }
}
