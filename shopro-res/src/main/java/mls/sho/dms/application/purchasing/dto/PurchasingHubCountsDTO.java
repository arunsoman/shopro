package mls.sho.dms.application.purchasing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Purchasing Hub navigation card counts.
 * Returns all counts in a single response for efficiency.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchasingHubCountsDTO {

    /**
     * Number of ingredients currently below par level (reorder staging).
     * Count excludes ingredients that already have pending purchase orders.
     */
    private long reorderStagingCount;

    /**
     * Number of Purchase Orders that need to be sent to suppliers.
     * Includes DRAFT, SENT, and PARTIAL status orders.
     */
    private long purchaseOrdersToSendCount;

    /**
     * Number of Goods Receipts pending invoice creation.
     * Includes received GRNs that haven't been matched to an invoice yet.
     */
    private long goodsReceiptsPendingCount;

    /**
     * Number of pending 3-way matches.
     * Represents received goods that need to be matched with invoices.
     * This is essentially the same as goodsReceiptsPendingCount but 
     * provides semantic clarity for the UI.
     */
    private long threeWayMatchPendingCount;
}
