package mls.sho.dms.entity.inventory.procurement;

public enum PurchaseOrderStatus {
    DRAFT,
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,
    SENT,
    ACKNOWLEDGED,
    COUNTER_OFFERED,
    SHIPPED,
    PARTIALLY_RECEIVED,
    RECEIVED,
    DISCREPANCY_REVIEW,
    PARTIALLY_FULFILLED,
    GRN_FLAGGED,
    INVOICE_MATCHED,
    PAID,
    CLOSED,
    CANCELLED
}
