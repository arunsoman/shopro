package mls.sho.dms.entity.floor;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.staff.StaffMember;
import java.time.Instant;

/**
 * Represents a table reservation.
 * Supports US-4.1 (Smart Table Hold).
 */
@Entity
@Table(name = "reservation")
public class Reservation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private CustomerProfile customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id", nullable = false)
    private TableShape table;

    @Column(name = "reservation_time", nullable = false)
    private Instant reservationTime;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "party_size", nullable = false)
    private int partySize;

    @Column(name = "notes")
    private String notes;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private StaffMember createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_id")
    private StaffMember handledBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    public CustomerProfile getCustomer() { return customer; }
    public void setCustomer(CustomerProfile customer) { this.customer = customer; }
    public TableShape getTable() { return table; }
    public void setTable(TableShape table) { this.table = table; }
    public Instant getReservationTime() { return reservationTime; }
    public void setReservationTime(Instant reservationTime) { this.reservationTime = reservationTime; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public int getPartySize() { return partySize; }
    public void setPartySize(int partySize) { this.partySize = partySize; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public StaffMember getCreatedBy() { return createdBy; }
    public void setCreatedBy(StaffMember createdBy) { this.createdBy = createdBy; }
    public StaffMember getHandledBy() { return handledBy; }
    public void setHandledBy(StaffMember handledBy) { this.handledBy = handledBy; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
}
