package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.service.inventory.ReceivingService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.*;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class ReceivingServiceImpl implements ReceivingService {

    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderLineRepository poLineRepository;
    private final StaffMemberRepository staffRepository;
    private final RawIngredientRepository ingredientRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final GoodsReceiptNoteRepository grnRepository;
    private final GoodsReceiptNoteLineRepository grnLineRepository;
    private final VendorInvoiceRepository invoiceRepository;
    private final VendorInvoiceLineRepository invoiceLineRepository;
    private final NotificationLogRepository notificationRepository;

    public ReceivingServiceImpl(PurchaseOrderRepository poRepository,
                                PurchaseOrderLineRepository poLineRepository,
                                StaffMemberRepository staffRepository,
                                RawIngredientRepository ingredientRepository,
                                InventoryTransactionRepository transactionRepository,
                                GoodsReceiptNoteRepository grnRepository,
                                GoodsReceiptNoteLineRepository grnLineRepository,
                                VendorInvoiceRepository invoiceRepository,
                                VendorInvoiceLineRepository invoiceLineRepository,
                                NotificationLogRepository notificationRepository) {
        this.poRepository = poRepository;
        this.poLineRepository = poLineRepository;
        this.staffRepository = staffRepository;
        this.ingredientRepository = ingredientRepository;
        this.transactionRepository = transactionRepository;
        this.grnRepository = grnRepository;
        this.grnLineRepository = grnLineRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceLineRepository = invoiceLineRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public GoodsReceiptNote receiveGoods(UUID poId, UUID receiverId, Map<UUID, BigDecimal> receivedQuantities, String deliveryNoteReference, String notes) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));
        StaffMember receiver = staffRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver staff not found"));

        if (po.getStatus() != PurchaseOrderStatus.SENT && po.getStatus() != PurchaseOrderStatus.ACKNOWLEDGED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("PO is not in a receivable state. Current status: " + po.getStatus());
        }

        GoodsReceiptNote grn = new GoodsReceiptNote();
        grn.setPurchaseOrder(po);
        grn.setReceivedBy(receiver);
        grn.setReceivedAt(Instant.now());
        grn.setDeliveryNoteReference(deliveryNoteReference);
        grn.setNotes(notes);
        grn = grnRepository.save(grn);

        boolean isPartial = false;
        var poLines = poLineRepository.findByPurchaseOrderId(poId);

        for (PurchaseOrderLine poLine : poLines) {
            BigDecimal qtyReceived = receivedQuantities.getOrDefault(poLine.getIngredient().getId(), BigDecimal.ZERO);
            
            if (qtyReceived.compareTo(BigDecimal.ZERO) > 0) {
                GoodsReceiptNoteLine grnLine = new GoodsReceiptNoteLine();
                grnLine.setGoodsReceiptNote(grn);
                grnLine.setIngredient(poLine.getIngredient());
                grnLine.setReceivedQty(qtyReceived);
                grnLineRepository.save(grnLine);

                // Update stock level
                RawIngredient ingredient = poLine.getIngredient();
                ingredient.setCurrentStock(ingredient.getCurrentStock().add(qtyReceived));
                ingredientRepository.save(ingredient);

                // Record transaction
                InventoryTransaction txn = new InventoryTransaction();
                txn.setIngredient(ingredient);
                txn.setTransactionType(InventoryTransactionType.PURCHASE_RECEIPT);
                txn.setQuantityDelta(qtyReceived);
                txn.setUnitCostAtTime(poLine.getUnitCost());
                txn.setTransactedAt(Instant.now());
                txn.setReferenceId(grn.getId());
                txn.setReason("GRN Receipt for PO " + po.getId());
                transactionRepository.save(txn);
            }

            // Check if received < ordered
            if (qtyReceived.compareTo(poLine.getOrderedQty()) < 0) {
                isPartial = true;
            }
        }

        // We use RECEIVED as the status indicating all items were received, and PARTIALLY_RECEIVED for some
        if (isPartial) {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED); // We might need to handle this differently in US-15.1, but this matches GRN logic
        } else {
            po.setStatus(PurchaseOrderStatus.RECEIVED);
        }
        poRepository.save(po);

        return grn;
    }

    @Override
    @Transactional
    public PurchaseOrder processInvoiceAndMatch(UUID poId, String invoiceNumber, Map<UUID, BigDecimal> invoicedQuantities, Map<UUID, BigDecimal> invoicedPrices, BigDecimal totalAmount, BigDecimal taxAmount) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));

        if (po.getStatus() != PurchaseOrderStatus.RECEIVED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("Cannot match invoice for PO in status: " + po.getStatus());
        }

        // Save Invoice
        VendorInvoice invoice = new VendorInvoice();
        invoice.setPurchaseOrder(po);
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setInvoiceDate(java.time.LocalDate.now());
        invoice.setUploadedAt(Instant.now());
        invoice.setTotalAmount(totalAmount);
        invoice.setTaxAmount(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        invoice = invoiceRepository.save(invoice);

        var poLines = poLineRepository.findByPurchaseOrderId(poId);
        var grns = grnRepository.findByPurchaseOrderId(poId);
        
        // Accumulate GRN quantities
        Map<UUID, BigDecimal> grnReceivedTotals = new java.util.HashMap<>();
        for (GoodsReceiptNote grn : grns) {
            for (GoodsReceiptNoteLine line : grnLineRepository.findByGoodsReceiptNoteId(grn.getId())) {
                grnReceivedTotals.merge(line.getIngredient().getId(), line.getReceivedQty(), BigDecimal::add);
            }
        }

        boolean priceVarianceRequiresReview = false;
        boolean quantityDiscrepancy = false;

        for (PurchaseOrderLine poLine : poLines) {
            UUID ingredientId = poLine.getIngredient().getId();
            BigDecimal invoicedQty = invoicedQuantities.getOrDefault(ingredientId, BigDecimal.ZERO);
            BigDecimal invoicedPrice = invoicedPrices.getOrDefault(ingredientId, poLine.getUnitCost());

            VendorInvoiceLine invLine = new VendorInvoiceLine();
            invLine.setVendorInvoice(invoice);
            invLine.setIngredient(poLine.getIngredient());
            invLine.setInvoicedQty(invoicedQty);
            invLine.setUnitPrice(invoicedPrice);
            invoiceLineRepository.save(invLine);

            BigDecimal orderedQty = poLine.getOrderedQty();
            BigDecimal receivedQty = grnReceivedTotals.getOrDefault(ingredientId, BigDecimal.ZERO);
            BigDecimal poPrice = poLine.getUnitCost();

            // 1. Quantity Match (Received < Ordered -> PARTIALLY_FULFILLED)
            if (receivedQty.compareTo(orderedQty) < 0) {
                quantityDiscrepancy = true;
            }

            // 2. Price Match 
            // If invoice price > PO price by more than 2%
            if (invoicedPrice.compareTo(poPrice) > 0) {
                BigDecimal variance = invoicedPrice.subtract(poPrice).divide(poPrice, 4, RoundingMode.HALF_UP);
                if (variance.compareTo(new BigDecimal("0.02")) > 0) {
                    priceVarianceRequiresReview = true;
                } else {
                    // <= 2% tolerance -> Auto accepted with warning
                    logWarning("Price variance <= 2% auto-accepted on PO " + poId + " for ingredient " + poLine.getIngredient().getName());
                }
            }
            
            // Only update Moving Average Cost when Closed/Accepted. We leave it as is until fully resolved.
        }

        if (priceVarianceRequiresReview) {
            po.setStatus(PurchaseOrderStatus.DISCREPANCY_REVIEW);
            notifyManager("Price discrepancy on PO " + poId + " requires Manager review.");
        } else if (quantityDiscrepancy) {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_FULFILLED);
            notifyManager("Quantity shortfall on PO " + poId + " (Received < Ordered).");
        } else {
            po.setStatus(PurchaseOrderStatus.CLOSED);
            notifyManager("PO " + poId + " — 3-way match passed. Ready for payment.");
            // Here we would also update moving average cost and vendor performance, but we'll do that in a separate step or US-15.2
        }

        return poRepository.save(po);
    }

    private void logWarning(String message) {
        NotificationLog warn = new NotificationLog();
        warn.setRecipient("SYSTEM");
        warn.setMessage(message);
        warn.setType(NotificationLog.NotificationType.IN_APP);
        warn.setStatus(NotificationLog.NotificationStatus.SENT);
        warn.setSentAt(Instant.now());
        notificationRepository.save(warn);
    }
    
    private void notifyManager(String message) {
        NotificationLog notif = new NotificationLog();
        notif.setRecipient("MANAGER_GROUP"); // Placeholder for actual manager routing
        notif.setMessage(message);
        notif.setType(NotificationLog.NotificationType.IN_APP);
        notif.setStatus(NotificationLog.NotificationStatus.PENDING);
        notif.setSentAt(Instant.now());
        notificationRepository.save(notif);
    }
}
