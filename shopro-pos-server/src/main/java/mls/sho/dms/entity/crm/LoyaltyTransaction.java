package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.order.OrderTicket;

/**
 * Audit log of points earned or redeemed by a customer.
 */
@Entity
@Table(
    name = "loyalty_transaction",
    indexes = {
        @Index(name = "idx_loyalty_transaction_customer", columnList = "customer_profile_id, created_at")
    }
)
public class LoyaltyTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_profile_id", nullable = false)
    private CustomerProfile customerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_ticket_id")
    private OrderTicket orderTicket;

    @Column(name = "points", nullable = false)
    private int points; // Positive for earned, negative for redeemed

    @Column(name = "description", length = 200)
    private String description;

    public CustomerProfile getCustomerProfile() { return customerProfile; }
    public void setCustomerProfile(CustomerProfile customerProfile) { this.customerProfile = customerProfile; }
    public OrderTicket getOrderTicket() { return orderTicket; }
    public void setOrderTicket(OrderTicket orderTicket) { this.orderTicket = orderTicket; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
