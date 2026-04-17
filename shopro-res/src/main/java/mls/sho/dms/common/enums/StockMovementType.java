package mls.sho.dms.common.enums;

/**
 * High-fidelity domain events for the Perpetual Inventory Intelligence system.
 */
public enum StockMovementType {
    RECEIVING,          // Shipment intake from a GRN
    DEPLETION,          // Recipe-driven consumption from a POS Order
    PRODUCTION_IN,      // New prepped stock from a Batching run
    PRODUCTION_OUT,     // Raw consumption used in Batching
    MISFIRE,            // Kitchen error/loss linked to an order
    DISCARD,            // Spoilage, waste, or breakage
    RECONCILIATION,     // Physical count alignment
    RETURN,             // Returning item to supplier
    STOCK_REVERSAL,     // Reversing a depletion due to order cancellation
    COST_BASIS_UPDATE   // Invoice posted - update ingredient cost basis
}
