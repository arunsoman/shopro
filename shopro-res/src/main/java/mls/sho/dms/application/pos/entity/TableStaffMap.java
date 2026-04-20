package mls.sho.dms.application.pos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Staff;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Maps staff members to tables they are assigned to serve.
 * This enables tracking which server is responsible for which table.
 */
@Entity
@Table(name = "table_staff_map",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "table_id", "staff_id"}),
       indexes = {
           @Index(name = "idx_table_staff_restaurant", columnList = "restaurant_id"),
           @Index(name = "idx_table_staff_table", columnList = "table_id"),
           @Index(name = "idx_table_staff_staff", columnList = "staff_id")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableStaffMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private DiningTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name = "assignment_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssignmentType assignmentType = AssignmentType.PRIMARY;

    @Column(name = "assigned_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime assignedAt;

    @Column(name = "assigned_by")
    private UUID assignedBy;

    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;

    @Column(name = "unassigned_by")
    private UUID unassignedBy;

    @Column(name = "unassigned_reason")
    private String unassignedReason;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Assignment type for the staff-table relationship.
     */
    public enum AssignmentType {
        PRIMARY,      // Main server for the table
        SECONDARY,     // Backup server (e.g., when primary is busy)
        SUPPORT        // Helper staff (busboy, runner)
    }
}
