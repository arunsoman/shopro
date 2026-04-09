package mls.sho.dms.entity.order;

/**
 * DINE_IN  — Order linked to a physical table.
 * TAKEAWAY — Order for pickup, no table link.
 * DELIVERY — Order for home delivery, requires address and driver.
 * CURBSIDE — Order for curbside pickup, requires vehicle details.
 */
public enum OrderType {
    DINE_IN,
    TAKEAWAY,
    DELIVERY,
    CURBSIDE
}
