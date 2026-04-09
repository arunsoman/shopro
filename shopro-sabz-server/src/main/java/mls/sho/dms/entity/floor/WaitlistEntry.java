package mls.sho.dms.entity.floor;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;
import java.time.Instant;

/**
 * Represents a customer on the digital waitlist (US-3.1).
 */
@Entity
@Table(name = "waitlist_entry")
public class WaitlistEntry extends BaseEntity {

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "party_size", nullable = false)
    private int partySize;

    @Column(name = "estimated_wait_minutes")
    private int estimatedWaitMinutes;

    @Column(name = "notified_at")
    private Instant notifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seated_at_table_id")
    private TableShape seatedAtTable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_id")
    private StaffMember handledBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public int getPartySize() { return partySize; }
    public void setPartySize(int partySize) { this.partySize = partySize; }
    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }
    public Instant getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(Instant notifiedAt) { this.notifiedAt = notifiedAt; }
    public TableShape getSeatedAtTable() { return seatedAtTable; }
    public void setSeatedAtTable(TableShape seatedAtTable) { this.seatedAtTable = seatedAtTable; }
    public StaffMember getHandledBy() { return handledBy; }
    public void setHandledBy(StaffMember handledBy) { this.handledBy = handledBy; }
    public WaitlistStatus getStatus() { return status; }
    public void setStatus(WaitlistStatus status) { this.status = status; }
}
