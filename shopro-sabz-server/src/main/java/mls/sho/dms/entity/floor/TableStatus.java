package mls.sho.dms.entity.floor;

/**
 * Real-time table lifecycle status machine.
 * Strictly adheres to the 11-state model defined in 04_FLOOR_PLAN_REQUIREMENTS.md.
 */
public enum TableStatus {
    AVAILABLE,      // Green: Clean and ready
    HELD,           // Yellow: Reserved for upcoming reservation
    OCCUPIED,       // Blue: Guests seated, no order yet
    ORDERED,        // Added to match seed data and frontend
    ORDER_PLACED,   // Purple: Order sent to kitchen (replaces FOOD_SENT)
    DELIVERED,      // Added to match frontend
    FOOD_DELIVERED, // Orange: Food at table, eating in progress
    DESSERT_COURSE, // Pink: Main cleared, dessert/drinks ongoing
    CHECK_DROPPED,  // Black: Bill presented, awaiting payment
    PAYING,         // Gray: Payment processing
    DIRTY,          // Red: Guests left, needs bussing
    CLEANING,       // Brown: Staff cleaning, not ready
    MAINTENANCE,    // White: Out of service
    INACTIVE       // Gray: Non-serviceable decor/static element
}
