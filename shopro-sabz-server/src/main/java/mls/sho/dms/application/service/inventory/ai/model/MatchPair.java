package mls.sho.dms.application.service.inventory.ai.model;

import lombok.Data;

/**
 * One aligned triple: the best matching line item from PO, Invoice, and GRN.
 */
@Data
public class MatchPair {
    private LineItem poItem;
    private LineItem invoiceItem;
    private LineItem grnItem;

    // Cosine distances from Hungarian cost matrix
    private double poInvoiceDistance;
    private double poGrnDistance;
    private double invoiceGrnDistance;

    // Computed deltas
    private double qtyDeltaPoInv;     // invoice qty - PO qty
    private double qtyDeltaPoGrn;     // GRN qty    - PO qty
    private double priceDeltaPct;     // % price change invoice vs PO

    private MatchStatus status;
    private String remark;       // human-readable explanation

    /** Canonical description: uses PO item desc, falls back to invoice, then GRN */
    public String getCanonicalDescription() {
        if (poItem != null && poItem.getDescription() != null) return poItem.getDescription();
        if (invoiceItem != null && invoiceItem.getDescription() != null) return invoiceItem.getDescription();
        if (grnItem != null && grnItem.getDescription() != null) return grnItem.getDescription();
        return "(unknown)";
    }
}
