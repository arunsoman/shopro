package mls.sho.dms.entity.inventory;

public enum PurchaseOrderStatus {
    DRAFT,
    PENDING_APPROVAL,
    APPROVED,
    REJECTED,
    SENT,
    ACKNOWLEDGED,
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
