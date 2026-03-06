package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.crm.CustomerProfile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * The central order entity. Represents one bill for a table (or a sub-ticket for split bills).
 * A split bill produces multiple OrderTicket rows all sharing the same parent_ticket_id.
 *
 * PostgreSQL strategy:
 *   - Composite index on (table_id, status): host and server screens load open tickets per table.
 *   - Composite index on (server_id, created_at DESC): server's shift view sorted by time.
 *   - Composite index on (status, created_at DESC): manager's EOD search — open/paid tickets.
 */
@Entity
@Table(
    name = "order_ticket",
    indexes = {
        @Index(name = "idx_ticket_table_status",   columnList = "table_id, status"),
        @Index(name = "idx_ticket_server_time",     columnList = "server_id, created_at"),
        @Index(name = "idx_ticket_status_time",     columnList = "status, created_at"),
        @Index(name = "idx_ticket_customer",        columnList = "customer_profile_id")
    }
)
public class OrderTicket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id")
    private TableShape table;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false)
    private StaffMember server;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType = OrderType.DINE_IN;
    
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    /** For split bills: reference to the original parent ticket. Null for primary tickets. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_ticket_id")
    private OrderTicket parentTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_profile_id")
    private CustomerProfile customerProfile;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "vehicle_model", length = 50)
    private String vehicleModel;

    @Column(name = "vehicle_color", length = 30)
    private String vehicleColor;

    @Column(name = "vehicle_plate", length = 20)
    private String vehiclePlate;

    @Column(name = "cover_count", nullable = false)
    private int coverCount = 1;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tip_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_at")
    private Instant paidAt;

    public TableShape getTable() { return table; }
    public void setTable(TableShape table) { this.table = table; }
    public StaffMember getServer() { return server; }
    public void setServer(StaffMember server) { this.server = server; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public OrderTicket getParentTicket() { return parentTicket; }
    public void setParentTicket(OrderTicket parentTicket) { this.parentTicket = parentTicket; }
    public int getCoverCount() { return coverCount; }
    public void setCoverCount(int coverCount) { this.coverCount = coverCount; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getTipAmount() { return tipAmount; }
    public void setTipAmount(BigDecimal tipAmount) { this.tipAmount = tipAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    public CustomerProfile getCustomerProfile() { return customerProfile; }
    public void setCustomerProfile(CustomerProfile customerProfile) { this.customerProfile = customerProfile; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    public String getVehicleColor() { return vehicleColor; }
    public void setVehicleColor(String vehicleColor) { this.vehicleColor = vehicleColor; }
    public String getVehiclePlate() { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate) { this.vehiclePlate = vehiclePlate; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
