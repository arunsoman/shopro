package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Staff;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Daily hours + cost for one hourly employee in one week.
 */
@Entity
@Table(name = "employee_labor_record",
       uniqueConstraints = @UniqueConstraint(columnNames = {"staff_id", "week_start_date"}),
       indexes = @Index(name = "idx_labor_res_week", columnList = "restaurant_id, week_start_date"))
@Data
public class StaffLaborRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    // Daily hours
    @Column(name = "hours_mon", precision = 5, scale = 2) private BigDecimal hoursMon;
    @Column(name = "hours_tue", precision = 5, scale = 2) private BigDecimal hoursTue;
    @Column(name = "hours_wed", precision = 5, scale = 2) private BigDecimal hoursWed;
    @Column(name = "hours_thu", precision = 5, scale = 2) private BigDecimal hoursThu;
    @Column(name = "hours_fri", precision = 5, scale = 2) private BigDecimal hoursFri;
    @Column(name = "hours_sat", precision = 5, scale = 2) private BigDecimal hoursSat;
    @Column(name = "hours_sun", precision = 5, scale = 2) private BigDecimal hoursSun;

    // Rate snapshot at time of entry (hourly employees only)
    @Column(name = "rate_snapshot", precision = 8, scale = 2) private BigDecimal rateSnapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
