package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.service.inventory.ReceivingService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.application.service.core.NotificationEngine;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.*;
import mls.sho.dms.repository.staff.StaffRepository;
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
    private final StaffRepository staffRepository;
    private final RawIngredientRepository ingredientRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final GoodsReceiptNoteRepository grnRepository;
    private final GoodsReceiptNoteLineRepository grnLineRepository;
    private final VendorInvoiceRepository invoiceRepository;
    private final VendorInvoiceLineRepository invoiceLineRepository;
    private final NotificationEngine notificationEngine;
    private final POStateMachineService stateMachineService;
    private final SupplierPolicyRepository supplierPolicyRepository;

    public ReceivingServiceImpl(PurchaseOrderRepository poRepository,
                                PurchaseOrderLineRepository poLineRepository,
                                StaffRepository staffRepository,
                                RawIngredientRepository ingredientRepository,
                                InventoryTransactionRepository transactionRepository,
                                GoodsReceiptNoteRepository grnRepository,
                                GoodsReceiptNoteLineRepository grnLineRepository,
                                VendorInvoiceRepository invoiceRepository,
                                VendorInvoiceLineRepository invoiceLineRepository,
                                NotificationEngine notificationEngine,
                                POStateMachineService stateMachineService,
                                SupplierPolicyRepository supplierPolicyRepository) {
        this.poRepository = poRepository;
        this.poLineRepository = poLineRepository;
        this.staffRepository = staffRepository;
        this.ingredientRepository = ingredientRepository;
        this.transactionRepository = transactionRepository;
        this.grnRepository = grnRepository;
        this.grnLineRepository = grnLineRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceLineRepository = invoiceLineRepository;
        this.notificationEngine = notificationEngine;
        this.stateMachineService = stateMachineService;
        this.supplierPolicyRepository = supplierPolicyRepository;
    }

    @Override
    @Transactional
    public GoodsReceiptNote receiveGoods(UUID poId, UUID receiverId, Map<UUID, BigDecimal> receivedQuantities, String deliveryNoteReference, String notes) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));
        StaffMember receiver = staffRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver staff not found"));

        if (po.getStatus() != PurchaseOrderStatus.SHIPPED && po.getStatus() != PurchaseOrderStatus.SENT && po.getStatus() != PurchaseOrderStatus.ACKNOWLEDGED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
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

        // 3-Way Match logic for status
        if (isPartial) {
            stateMachineService.transition(poId, PurchaseOrderStatus.PARTIALLY_RECEIVED, receiverId, "Partial shipment received");
        } else {
            stateMachineService.transition(poId, PurchaseOrderStatus.RECEIVED, receiverId, "Full shipment received");
        }

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

        // Fetch Supplier Policy for tolerances
        SupplierPolicy policy = supplierPolicyRepository.findById(po.getSupplier().getId())
                .orElse(new SupplierPolicy());

        BigDecimal qtyTolerance = policy.getQtyTolerance().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal priceTolerance = policy.getPriceTolerance().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

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

            // 1. Quantity Match (Received vs Invoiced vs Ordered)
            if (invoicedQty.compareTo(receivedQty) > 0) {
                 BigDecimal variance = invoicedQty.subtract(receivedQty).divide(receivedQty, 4, RoundingMode.HALF_UP);
                 if (variance.compareTo(qtyTolerance) > 0) {
                     quantityDiscrepancy = true;
                 }
            }

            // 2. Price Match (Invoiced vs PO Price)
            if (invoicedPrice.compareTo(poPrice) > 0) {
                BigDecimal variance = invoicedPrice.subtract(poPrice).divide(poPrice, 4, RoundingMode.HALF_UP);
                if (variance.compareTo(priceTolerance) > 0) {
                    priceVarianceRequiresReview = true;
                }
            }
        }

        if (priceVarianceRequiresReview || quantityDiscrepancy) {
            stateMachineService.transition(poId, PurchaseOrderStatus.DISCREPANCY_REVIEW, UUID.randomUUID(), "Discrepancy detected outside tolerance");
        } else {
            stateMachineService.transition(poId, PurchaseOrderStatus.CLOSED, UUID.randomUUID(), "3-Way Match Passed");
        }

        return poRepository.findById(poId).get();
    }

    private void logWarning(String message) {
        notificationEngine.sendNotification(
            "SYSTEM_WARNING", 
            "PO Receiving Warning", 
            message, 
            Map.of("module", "purchasing"), 
            null
        );
    }
    
    private void notifyManager(String message) {
        notificationEngine.sendNotification(
            "PO_APPROVAL", 
            "PO Receiving Update", 
            message, 
            Map.of("module", "purchasing"), 
            null
        );
    }
}
