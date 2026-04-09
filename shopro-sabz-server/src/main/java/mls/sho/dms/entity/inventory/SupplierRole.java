package mls.sho.dms.entity.inventory;

/**
 * Roles for external supplier contacts.
 */
public enum SupplierRole {
    SUPPLIER_ADMIN,   // Can manage other users in their organization
    SUPPLIER_BIDDER,  // Can respond to RFQs
    SUPPLIER_PLANNER  // Can view inventory levels for collaborative forecasting
}
