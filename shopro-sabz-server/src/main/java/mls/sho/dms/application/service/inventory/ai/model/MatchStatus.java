package mls.sho.dms.application.service.inventory.ai.model;

public enum MatchStatus {
    MATCHED,          // all three documents agree
    QTY_MISMATCH,     // quantity differs between documents
    PRICE_VARIANCE,   // unit price differs above threshold
    MISSING_IN_GRN,   // item on PO/Invoice but not received
    MISSING_IN_INV,   // item received but not invoiced
    EXTRA_IN_INV,     // item on invoice not on PO
    ANOMALY           // Isolation Forest flagged as suspicious
}
