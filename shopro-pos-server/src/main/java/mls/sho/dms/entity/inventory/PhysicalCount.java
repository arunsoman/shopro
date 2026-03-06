package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.LocalDate;

/**
 * A physical inventory count session conducted by kitchen staff.
 * One PhysicalCount record per counting session; multiple PhysicalCountLine records within it.
 */
@Entity
@Table(
    name = "physical_count",
    indexes = {
        @Index(name = "idx_physical_count_date",   columnList = "count_date"),
        @Index(name = "idx_physical_count_status", columnList = "status")
    }
)
public class PhysicalCount extends BaseEntity {

    @Column(name = "count_date", nullable = false)
    private LocalDate countDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PhysicalCountStatus status = PhysicalCountStatus.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "counted_by_id", nullable = false)
    private StaffMember countedBy;

    public LocalDate getCountDate() { return countDate; }
    public void setCountDate(LocalDate countDate) { this.countDate = countDate; }
    public PhysicalCountStatus getStatus() { return status; }
    public void setStatus(PhysicalCountStatus status) { this.status = status; }
    public StaffMember getCountedBy() { return countedBy; }
    public void setCountedBy(StaffMember countedBy) { this.countedBy = countedBy; }
}
