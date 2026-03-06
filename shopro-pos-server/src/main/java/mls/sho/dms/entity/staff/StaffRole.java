package mls.sho.dms.entity.staff;

/**
 * Canonical set of staff roles in the Shopro POS system.
 * Stored as STRING in PostgreSQL for readability and migration safety.
 */
public enum StaffRole {
    SERVER,
    CASHIER,
    MANAGER,
    CHEF,
    LINE_COOK,
    HOST,
    HOSTESS,
    BUSSER,
    EXPEDITOR,
    OWNER
}
