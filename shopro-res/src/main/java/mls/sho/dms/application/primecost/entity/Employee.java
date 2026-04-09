package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Master employee record for the Prime Cost module.
 */
@Entity
@Table(name = "employee",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name"}))
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type", nullable = false)
    private EmployeeType employeeType;

    @Column(name = "hourly_rate", precision = 8, scale = 2)
    private BigDecimal hourlyRate; // null for salaried

    @Column(name = "annual_salary", precision = 12, scale = 2)
    private BigDecimal annualSalary; // null for hourly

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EmployeeType {
        MANAGEMENT,
        HOURLY
    }
}
