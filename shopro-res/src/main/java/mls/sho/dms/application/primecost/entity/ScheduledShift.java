package mls.sho.dms.application.primecost.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.common.enums.KitchenStationType;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Staff;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Scheduled (planned) shift for labor analysis.
 */
@Entity
@Table(name = "scheduled_shift",
       indexes = @Index(name = "idx_shift_res_date", columnList = "restaurant_id, shift_date"))
@Data
public class ScheduledShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "station")
    private KitchenStationType station;

    @Column(name = "notes", length = 200)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
