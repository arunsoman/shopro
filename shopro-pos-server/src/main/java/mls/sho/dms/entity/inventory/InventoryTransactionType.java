package mls.sho.dms.entity.inventory;

/**
 * Positive quantityDelta: RESTOCK, OPENING_STOCK, PURCHASE_RECEIPT. 
 * Negative quantityDelta: SALE, WASTE, DEPLETION.
 * Manual adjustments can be either positive or negative.
 */
public enum InventoryTransactionType {
    SALE,                     // Auto - triggered by POS ticket fire (also called DEPLETION)
    VOID_REVERSAL,            // Auto - triggered by pre-prep void restores stock
    WASTE,                    // Manual - post-prep void or direct POS waste log
    PURCHASE_RECEIPT,         // Auto - triggered by Purchase Order receiving
    PHYSICAL_COUNT_ADJUSTMENT,// Manual - physical count variance correction
    OPENING_STOCK,            // One-time - initial stock entry
    RESTOCK                   // Manual - general restock outside of PO flow
}
