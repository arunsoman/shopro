package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "staff_compensation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffCompensation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "compensation_id")
    private UUID compensationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, unique = true)
    private Staff staff;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Builder.Default
    @Column(name = "base_hourly_rate", precision = 12, scale = 2, nullable = false)
    private BigDecimal baseHourlyRate = BigDecimal.ZERO;

    @Column(name = "overtime_rate", precision = 12, scale = 2)
    private BigDecimal overtimeRate;

    @Column(name = "holiday_rate", precision = 12, scale = 2)
    private BigDecimal holidayRate;

    @Builder.Default
    @Column(name = "standard_weekly_hours")
    private Integer standardWeeklyHours = 40;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
