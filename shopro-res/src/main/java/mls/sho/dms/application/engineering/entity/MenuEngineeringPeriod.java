package mls.sho.dms.application.engineering.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.entity.Restaurant;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A named time-window over which menu engineering analysis is run.
 */
@Entity
@Table(name = "menu_engineering_period",
       indexes = @Index(name = "idx_mep_restaurant", columnList = "restaurant_id"))
@Data
public class MenuEngineeringPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "period_name", nullable = false)
    private String periodName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PeriodStatus status = PeriodStatus.DRAFT;

    /** Serialised analysis results (JSON), populated after runPeriod(). */
    @Column(name = "results_json", columnDefinition = "TEXT")
    private String resultsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "run_at")
    private LocalDateTime runAt;

    public enum PeriodStatus { DRAFT, COMPLETE }
}
