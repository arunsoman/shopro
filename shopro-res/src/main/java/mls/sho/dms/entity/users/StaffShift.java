package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

@Entity
@Table(name = "staff_shift")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffShift {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shift_id")
    private UUID shiftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "clock_in", nullable = false)
    private LocalDateTime clockIn;

    @Column(name = "clock_out")
    private LocalDateTime clockOut;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "duration_minutes")
    private Long durationMinutes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void clockOut() {
        this.clockOut = LocalDateTime.now();
        this.isActive = false;
        if (this.clockIn != null) {
            this.durationMinutes = Duration.between(this.clockIn, this.clockOut).toMinutes();
        }
    }
}
