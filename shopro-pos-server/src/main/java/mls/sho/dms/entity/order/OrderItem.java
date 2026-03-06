package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.menu.MenuItem;

import java.math.BigDecimal;

/**
 * A single line item on an OrderTicket.
 *
 * PostgreSQL strategy:
 *   - Partial index on (ticket_id) WHERE status != 'VOIDED': most application code
 *     filters out voided items — this keeps the hot index small.
 *   - unitPrice is captured at order time and never recalculated from the menu item,
 *     preserving historical pricing accuracy even if basePrice changes later.
 */
@Entity
@Table(
    name = "order_item",
    indexes = {
        @Index(name = "idx_order_item_ticket",        columnList = "ticket_id"),
        @Index(name = "idx_order_item_ticket_active",  columnList = "ticket_id, status") // partial in DDL
    }
)
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private OrderTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "quantity", nullable = false)
    private int quantity = 1;

    /** Price captured at time of ordering — immutable snapshot of MenuItem.basePrice. */
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "modifier_upcharge_total", nullable = false, precision = 8, scale = 2)
    private BigDecimal modifierUpchargeTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderItemStatus status = OrderItemStatus.PENDING;

    /** Free-text special instructions (max 100 chars as per US-2.4). */
    @Column(name = "custom_note", length = 100)
    private String customNote;

    @Column(name = "course_number", nullable = false)
    private int courseNumber = 1;

    @Column(name = "fired_at")
    private java.time.Instant firedAt;

    /** True when the Server has flagged this item with an allergy warning. Renders in red on KDS. */
    @Column(name = "has_allergy_flag", nullable = false)
    private boolean hasAllergyFlag = false;

    /** True when this item represents a subtraction (e.g., "NO Onions"). */
    @Column(name = "is_subtraction", nullable = false)
    private boolean isSubtraction = false;

    public OrderTicket getTicket() { return ticket; }
    public void setTicket(OrderTicket ticket) { this.ticket = ticket; }
    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getModifierUpchargeTotal() { return modifierUpchargeTotal; }
    public void setModifierUpchargeTotal(BigDecimal modifierUpchargeTotal) { this.modifierUpchargeTotal = modifierUpchargeTotal; }
    public OrderItemStatus getStatus() { return status; }
    public void setStatus(OrderItemStatus status) { this.status = status; }
    public String getCustomNote() { return customNote; }
    public void setCustomNote(String customNote) { this.customNote = customNote; }
    public boolean isHasAllergyFlag() { return hasAllergyFlag; }
    public void setHasAllergyFlag(boolean hasAllergyFlag) { this.hasAllergyFlag = hasAllergyFlag; }
    public boolean isSubtraction() { return isSubtraction; }
    public void setSubtraction(boolean subtraction) { isSubtraction = subtraction; }

    public int getCourseNumber() { return courseNumber; }
    public void setCourseNumber(int courseNumber) { this.courseNumber = courseNumber; }
    public java.time.Instant getFiredAt() { return firedAt; }
    public void setFiredAt(java.time.Instant firedAt) { this.firedAt = firedAt; }
}
