package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;

/**
 * Tracks the dispatch and delivery status of a Takeaway/Delivery order.
 */
@Entity
@Table(
    name = "delivery_dispatch",
    indexes = {
        @Index(name = "idx_delivery_status", columnList = "delivery_status, dispatch_time")
    }
)
public class DeliveryDispatch extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_ticket_id", nullable = false)
    private OrderTicket orderTicket;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    @Column(name = "dispatch_time")
    private Instant dispatchTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private StaffMember driver;

    @Column(name = "aggregator_reference_id", length = 100)
    private String aggregatorReferenceId;

    public OrderTicket getOrderTicket() { return orderTicket; }
    public void setOrderTicket(OrderTicket orderTicket) { this.orderTicket = orderTicket; }
    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public Instant getDispatchTime() { return dispatchTime; }
    public void setDispatchTime(Instant dispatchTime) { this.dispatchTime = dispatchTime; }
    public StaffMember getDriver() { return driver; }
    public void setDriver(StaffMember driver) { this.driver = driver; }
    public String getAggregatorReferenceId() { return aggregatorReferenceId; }
    public void setAggregatorReferenceId(String aggregatorReferenceId) { this.aggregatorReferenceId = aggregatorReferenceId; }
}
