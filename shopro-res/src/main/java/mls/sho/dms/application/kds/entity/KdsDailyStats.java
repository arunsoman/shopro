package mls.sho.dms.application.kds.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * [K] Daily pre-aggregated analytics per station per outlet.
 * Built by a scheduled job from KdsEventLog at EOD.
 *
 * Stored separately so analytics queries don't scan the
 * event log. The event log is the source of truth; this
 * is a read-optimised projection.
 */
@Entity
@Table(name = "kds_daily_stats",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"outlet_id", "station_id", "stat_date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsDailyStats {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outlet_id", nullable = false)
    private Long outletId;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(name = "total_tickets")
    private Integer totalTickets;

    @Column(name = "total_items")
    private Integer totalItems;

    @Column(name = "avg_prep_time_seconds")
    private Integer avgPrepTimeSeconds;

    @Column(name = "p50_prep_time_seconds")
    private Integer p50PrepTimeSeconds;      // median

    @Column(name = "p90_prep_time_seconds")
    private Integer p90PrepTimeSeconds;      // 90th percentile

    @Column(name = "max_prep_time_seconds")
    private Integer maxPrepTimeSeconds;      // worst ticket of the day

    @Column(name = "tickets_over_warn")
    private Integer ticketsOverWarn;         // went amber

    @Column(name = "tickets_over_alert")
    private Integer ticketsOverAlert;        // went red

    @Column(name = "void_count")
    private Integer voidCount;

    @Column(name = "recall_count")
    private Integer recallCount;

    /** Peak hour: 0–23. The hour with the most tickets. */
    @Column(name = "peak_hour")
    private Integer peakHour;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
