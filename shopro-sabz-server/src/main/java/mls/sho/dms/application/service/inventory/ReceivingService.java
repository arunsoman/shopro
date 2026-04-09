package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.GoodsReceiptNote;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.VendorInvoice;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public interface ReceivingService {
    
    /**
     * Logs the receipt of goods against a specific Purchase Order.
     * Updates inventory current_stock_level based on received quantities.
     * 
     * @param poId The ID of the Purchase Order.
     * @param receiverId The ID of the StaffMember receiving the goods.
     * @param receivedQuantities Map of Ingredient ID to Received Quantity.
     * @param deliveryNoteReference Optional vendor delivery note reference.
     * @param notes Optional notes.
     * @return The created GoodsReceiptNote.
     */
    GoodsReceiptNote receiveGoods(UUID poId, UUID receiverId, Map<UUID, BigDecimal> receivedQuantities, String deliveryNoteReference, String notes);

    /**
     * Uploads the vendor invoice and performs the 3-Way Match.
     * 
     * @param poId The ID of the Purchase Order.
     * @param invoiceNumber The vendor's invoice number.
     * @param invoicedQuantities Map of Ingredient ID to Invoiced Quantity.
     * @param invoicedPrices Map of Ingredient ID to Unit Price on Invoice.
     * @param totalAmount Total amount on the invoice.
     * @param taxAmount Tax amount on the invoice.
     * @return The resulting PurchaseOrder after matching.
     */
    PurchaseOrder processInvoiceAndMatch(UUID poId, String invoiceNumber, Map<UUID, BigDecimal> invoicedQuantities, Map<UUID, BigDecimal> invoicedPrices, BigDecimal totalAmount, BigDecimal taxAmount);
}
