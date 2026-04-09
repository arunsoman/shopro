package mls.sho.dms.common.enums;

/**
 * Lifecycle stages for a Goods Receipt Note.
 */
public enum GoodsReceiptStatus {
    DRAFT,      // Initial entry
    RECEIVED,   // Items counted and added to stock
    CONFLICT,   // One or more lines raised as disputes
    CANCELLED   // Discarded record
}
