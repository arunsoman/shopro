package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.accounting.aop.AccountingEvent;
import mls.sho.mplace.accounting.aop.AccountingEventType;
import mls.sho.mplace.dto.*;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import mls.sho.mplace.repository.ProductRepository;
import mls.sho.mplace.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PurchaseOrderRepository poRepository;
    private final OrderItemRepository orderItemRepository;
    private final SupplierRepository supplierRepository;
    private final SubOrderRepository subOrderRepository;
    private final BidInvitationRepository bidInvitationRepository;
    private final BidItemRepository bidItemRepository;
    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;
    private final mls.sho.mplace.repository.InventoryItemRepository inventoryItemRepository;
    private final mls.sho.mplace.util.SecurityUtils securityUtils;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final SupplyListRepository supplyListRepository;
    private final POActivityRepository poActivityRepository;

    public List<SubOrderDetailsDto> getAllSubOrders() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();

        List<SubOrder> subOrders;
        if (requester.isSupplier()) {
            subOrders = subOrderRepository.findAllBySupplier_Id(requester.supplierId());
        } else if (requester.isBuyer()) {
            subOrders = subOrderRepository.findAllByPurchaseOrder_Restaurant_Id(requester.restaurantId());
        } else {
            subOrders = subOrderRepository.findAll();
        }

        return subOrders.stream()
                .map(this::mapToDetailsDto)
                .toList();
    }

    public List<PurchaseOrderDto> getAllOrders() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();

        List<PurchaseOrder> orders;
        if (requester.isBuyer()) {
            orders = poRepository.findAllByRestaurant_Id(requester.restaurantId());
        } else {
            orders = poRepository.findAll();
        }

        return orders.stream()
                .map(this::mapToDto)
                .toList();
    }

    public PurchaseOrderDto getOrderById(UUID id) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return null;

        PurchaseOrder po = poRepository.findById(id).orElse(null);
        if (po == null) return null;

        if (requester.isBuyer() && !po.getRestaurant().getId().equals(requester.restaurantId())) {
            throw new RuntimeException("Access Denied: Not your order");
        }

        return mapToDto(po);
    }

    public OrderAuditDto getOrderAudit(UUID id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        List<OrderAuditDto.ActivityEntry> activityEntries = poActivityRepository.findByPurchaseOrderIdOrderByActivityDateAsc(id).stream()
                .sorted(Comparator.comparing(POActivity::getActivityDate).reversed())
                .map(a -> new OrderAuditDto.ActivityEntry(
                        a.getStatus(),
                        a.getDescription(),
                        a.getActivityDate().toString(),
                        a.isCompleted(),
                        a.isInternal()
                )).toList();

        List<FinancialTransaction> transactions = financialTransactionRepository.findAllByPurchaseOrder_Id(id);
        // Also include suborder transactions
        List<SubOrder> subOrders = subOrderRepository.findAllByPurchaseOrder_Id(id);
        for (SubOrder so : subOrders) {
            transactions.addAll(financialTransactionRepository.findAllBySubOrder_Id(so.getId()));
        }

        List<OrderAuditDto.LedgerEntry> ledgerEntries = transactions.stream()
                .sorted(Comparator.comparing(FinancialTransaction::getTransactionDate).reversed())
                .map(t -> new OrderAuditDto.LedgerEntry(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getType().name(),
                        t.getStatus().name(),
                        t.getTransactionDate().toString()
                )).toList();

        List<OrderAuditDto.AllocationEntry> allocationEntries = subOrders.stream()
                .map(so -> new OrderAuditDto.AllocationEntry(
                        so.getId(),
                        so.getSupplier() != null ? so.getSupplier().getName() : "Unknown",
                        so.getTotalAmount(),
                        so.getStatus().name(),
                        so.getRoutingStrategy(),
                        so.getItems().stream().map(OrderItem::getItemName).toList()
                )).toList();

        return new OrderAuditDto(
                po.getId(),
                po.getReferenceNumber(),
                po.getRestaurant() != null ? po.getRestaurant().getName() : "Unknown",
                po.getStatus().name(),
                po.getDisplayStatus(),
                po.getCreatedAt().toString(),
                po.getTotalAmount(),
                activityEntries,
                ledgerEntries,
                allocationEntries
        );
    }

    @Transactional
    public PurchaseOrder createOrder(
            UUID restaurantId, 
            List<PurchaseOrderDto.OrderItemCreateRequest> itemRequests, 
            LocalDate deliveryDate,
            String deliveryAddress,
            String specialInstructions,
            String internalNotes
    ) {
        PurchaseOrder po = new PurchaseOrder();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found: " + restaurantId));
        po.setRestaurant(restaurant);
        po.setReferenceNumber("PO-" + System.currentTimeMillis());
        po.setDeliveryDate(deliveryDate);
        po.setDeliveryAddress(deliveryAddress);
        po.setSpecialInstructions(specialInstructions);
        po.setInternalNotes(internalNotes);
        po.setTotalAmount(BigDecimal.ZERO);
        
        PurchaseOrder savedPo = poRepository.saveAndFlush(po);
        System.out.println("DEBUG: Created PO with ID: " + savedPo.getId());
        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderDto.OrderItemCreateRequest req : itemRequests) {
            OrderItem item = new OrderItem();
            item.setPurchaseOrder(savedPo);
            
            UUID itemUUID;
            try {
                itemUUID = UUID.fromString(req.itemId());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid item ID format (" + req.itemId() + "). Please clear your cart and ensure you are ordering Inventory Items.");
            }

            InventoryItem inventoryItem = inventoryItemRepository.findById(itemUUID)
                    .orElseThrow(() -> new RuntimeException("Inventory Item not found: " + req.itemId()));
            
            item.setInventoryItem(inventoryItem);
            item.setQuantity(BigDecimal.valueOf(req.quantity()));
            item.setPriceAtOrder(req.unitPrice());
            item.setUnit(req.unit());
            item.setItemName(inventoryItem.getFood().getName());
            
            orderItemRepository.save(item);
            total = total.add(item.getPriceAtOrder().multiply(item.getQuantity()));
        }

        savedPo.setTotalAmount(total);

        // Initial Activity
        recordActivity(savedPo, "Order Placed", "Order registered in system", true, false);

        // Approval Logic
        if (total.compareTo(new BigDecimal("5000")) > 0) {
            savedPo.setStatus(PurchaseOrder.POStatus.PENDING_APPROVAL);
            savedPo.setApprovalRequired(true);
            savedPo.setApprovalStatus(PurchaseOrder.ApprovalStatus.PENDING);
            recordActivity(savedPo, "Pending Approval", "High value order requires management review", false, false);
        } else {
            savedPo.setStatus(PurchaseOrder.POStatus.ACCEPTED);
            savedPo.setApprovalRequired(false);
            savedPo.setApprovalStatus(PurchaseOrder.ApprovalStatus.NOT_REQUIRED);
            recordActivity(savedPo, "Accepted", "Order verified and accepted by system", true, false);
        }

        // Financial Transaction
        FinancialTransaction transaction = new FinancialTransaction();
        transaction.setRestaurant(restaurant);
        transaction.setPurchaseOrder(savedPo);
        transaction.setAmount(total);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setType(FinancialTransaction.TransactionType.PAYMENT);
        transaction.setStatus(FinancialTransaction.TransactionStatus.PENDING);
        transaction.setDescription("Purchase Order Commitment: " + savedPo.getReferenceNumber());
        financialTransactionRepository.save(transaction);

        // Auto-queue for MidMind Routing
        savedPo.setRoutingStatus(PurchaseOrder.RoutingStatus.PENDING_ROUTING);
        recordActivity(savedPo, "Queued for Routing", "Order scheduled for automated vendor routing", false, true);

        return poRepository.saveAndFlush(savedPo);
    }

    private void recordActivity(PurchaseOrder po, String status, String description, boolean completed, boolean isInternal) {
        POActivity activity = new POActivity();
        activity.setPurchaseOrder(po);
        activity.setStatus(status.toUpperCase());
        activity.setDescription(description);
        activity.setActivityDate(LocalDateTime.now());
        activity.setCompleted(completed);
        activity.setInternal(isInternal);
        if (po.getActivities() == null) {
            po.setActivities(new java.util.ArrayList<>());
        }
        po.getActivities().add(activity);
        
        if (!isInternal) {
            po.setDisplayStatus(status.toUpperCase());
        }
    }

    @Transactional
    public void updateSubOrderStatus(UUID subOrderId, String status) {
        SubOrder so = subOrderRepository.findById(subOrderId)
                .orElseThrow(() -> new RuntimeException("SubOrder not found"));
        so.setStatus(SubOrder.SubOrderStatus.valueOf(status));
        subOrderRepository.save(so);

        // Update parent PO visibility
        PurchaseOrder po = so.getPurchaseOrder();
        if (po != null) {
            String statusUpper = status.toUpperCase();
            if ("SHIPPED".equals(statusUpper)) {
                recordActivity(po, "In Transit", "Items are out for delivery", true, false);
            } else if ("DELIVERED".equals(statusUpper) || "COMPLETED".equals(statusUpper)) {
                recordActivity(po, "Delivered", "Order has been successfully fulfilled", true, false);
            }
            poRepository.save(po);
        }
    }

    @Transactional
    public void splitOrder(UUID poId, List<SplitItemRequest> splits) {
        var requester = securityUtils.getCurrentRequester();
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        Map<UUID, SubOrder> supplierSubOrders = new HashMap<>();

        for (SplitItemRequest split : splits) {
            OrderItem item = orderItemRepository.findById(split.orderItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));
            
            Supplier supplier = supplierRepository.findById(split.supplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));

            SubOrder subOrder = supplierSubOrders.computeIfAbsent(supplier.getId(), sid -> {
                SubOrder so = new SubOrder();
                so.setPurchaseOrder(po);
                so.setSupplier(supplier);
                so.setTotalAmount(BigDecimal.ZERO);
                so.setStatus(SubOrder.SubOrderStatus.ACK_PENDING);
                so.setAssignmentMode(SubOrder.AssignmentMode.DIRECT);
                return subOrderRepository.saveAndFlush(so);
            });

            item.setSubOrder(subOrder);
            subOrder.getItems().add(item); // Bidirectional sync
            subOrder.setTotalAmount(subOrder.getTotalAmount().add(item.getPriceAtOrder().multiply(item.getQuantity())));
            orderItemRepository.saveAndFlush(item);
        }

        // Trigger AutoAck after all items are associated
        supplierSubOrders.values().forEach(this::triggerAutoAck);

        po.setStatus(PurchaseOrder.POStatus.SPLIT_COMPLETE);
        recordActivity(po, "Supplier Confirmed", "Items allocated for delivery", true, false);
        poRepository.save(po);
    }

    @Transactional
    public void splitToBid(UUID poId, String bidTitle, List<UUID> itemIds) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        BidInvitation bid = new BidInvitation();
        bid.setPurchaseOrder(po);
        bid.setTitle(bidTitle);
        bid.setStatus(BidInvitation.BidStatus.OPEN);
        bid.setDeadline(java.time.LocalDateTime.now().plusDays(2));
        bidInvitationRepository.save(bid);

        for (UUID itemId : itemIds) {
            OrderItem item = orderItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found"));
            
            BidItem bidItem = new BidItem();
            bidItem.setBidInvitation(bid);
            bidItem.setProductName(item.getItemName() != null ? item.getItemName() : (item.getProduct() != null ? item.getProduct().getName() : item.getInventoryItem().getFood().getName()));
            bidItem.setQuantity(item.getQuantity());
            bidItem.setUnit(item.getUnit());
            bidItemRepository.save(bidItem);
            
            // Mark item as being in a bid process if needed
            // item.setInBid(true); 
        }

        po.setStatus(PurchaseOrder.POStatus.SPLITTING);
        poRepository.save(po);
    }

    private void triggerAutoAck(SubOrder subOrder) {
        Supplier supplier = subOrder.getSupplier();
        if (supplier == null) return;

        boolean allAuto = true;
        for (OrderItem item : subOrder.getItems()) {
            Optional<SupplyList> slOpt = supplyListRepository.findBySupplierIdAndFoodId(supplier.getId(), item.getInventoryItem().getFood().getId());
            if (slOpt.isPresent()) {
                SupplyList sl = slOpt.get();
                if (sl.getAutoResponseMode() && sl.getIsAvailable() && sl.getOfferCount() >= item.getQuantity().intValue()) {
                    sl.setOfferCount(sl.getOfferCount() - item.getQuantity().intValue());
                    supplyListRepository.save(sl);
                } else {
                    allAuto = false;
                }
            } else {
                allAuto = false;
            }
        }

        if (allAuto && !subOrder.getItems().isEmpty()) {
            subOrder.setStatus(SubOrder.SubOrderStatus.ACKNOWLEDGED); // Auto-Ack
            subOrderRepository.save(subOrder);
        }
    }

    private PurchaseOrderDto mapToDto(PurchaseOrder po) {
        String restaurantName = po.getRestaurant() != null ? po.getRestaurant().getName() : "Unknown";

        List<SubOrderDto> subOrderDtos = po.getSubOrders().stream()
                .map(so -> {
                    String supplierName = so.getSupplier() != null ? so.getSupplier().getName() : "Unknown";

                    List<OrderItemDto> itemDtos = so.getItems().stream()
                            .map(item -> new OrderItemDto(
                                    item.getId(),
                                    item.getItemName() != null ? item.getItemName() : (item.getProduct() != null ? item.getProduct().getName() : (item.getInventoryItem() != null ? item.getInventoryItem().getFood().getName() : "Unknown Product")),
                                    item.getQuantity().intValue(),
                                    item.getUnit(),
                                    item.getPriceAtOrder(),
                                    item.getPriceAtOrder().multiply(item.getQuantity())
                            )).toList();

                    return new SubOrderDto(
                            so.getId(),
                            supplierName,
                            so.getTotalAmount(),
                            so.getStatus().name(),
                            itemDtos
                    );
                }).toList();

        // If no suborders (not yet split), map from po.items
        List<OrderItemDto> items = po.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getItemName() != null ? item.getItemName() : (item.getProduct() != null ? item.getProduct().getName() : "Unknown Product"),
                        item.getQuantity().intValue(),
                        item.getUnit(),
                        item.getPriceAtOrder(),
                        item.getPriceAtOrder().multiply(item.getQuantity())
                )).toList();

        int totalItemsCount = po.getItems().stream()
                .mapToInt(item -> item.getQuantity().intValue())
                .sum();

        List<POActivityDto> activityDtos = po.getActivities().stream()
                .map(a -> new POActivityDto(
                        a.getStatus(),
                        a.getDescription(),
                        a.getActivityDate().toString(),
                        a.isCompleted(),
                        a.isInternal()
                )).toList();

        int fulfillmentScore = 0;
        if (!subOrderDtos.isEmpty()) {
            long totalSubOrders = subOrderDtos.size();
            long deliveredSubOrders = subOrderDtos.stream()
                    .filter(so -> "DELIVERED".equals(so.status()) || "COMPLETED".equals(so.status()))
                    .count();
            fulfillmentScore = (int) ((deliveredSubOrders * 100) / totalSubOrders);
        }

        return new PurchaseOrderDto(
                po.getId(),
                po.getReferenceNumber(),
                restaurantName,
                po.getTotalAmount(),
                po.getStatus().name(),
                po.getDisplayStatus(),
                po.getDeliveryDate(),
                po.getDeliveryAddress(),
                po.getSpecialInstructions(),
                po.getInternalNotes(),
                po.isApprovalRequired(),
                po.getApprovalStatus() != null ? po.getApprovalStatus().name() : null,
                po.getSource().name(),
                po.getCreatedAt(),
                totalItemsCount,
                subOrderDtos,
                items,
                activityDtos,
                fulfillmentScore
        );
    }

    public TraceabilityStatsDto getTraceabilityStats() {
        long totalLogs = poActivityRepository.count();
        long activeNodes = subOrderRepository.count(); // Actually sub-orders are nodes
        return new TraceabilityStatsDto(totalLogs, activeNodes, "100%");
    }

    private SubOrderDetailsDto mapToDetailsDto(SubOrder so) {
        return new SubOrderDetailsDto(
                so.getId(),
                "SPO-" + so.getId().toString().substring(0, 8).toUpperCase(),
                so.getPurchaseOrder() != null ? so.getPurchaseOrder().getReferenceNumber() : "Unknown",
                so.getSupplier() != null ? so.getSupplier().getName() : "Unknown",
                so.getTotalAmount(),
                so.getMarkupAmount(),
                so.getStatus().name(),
                so.getCreatedAt(),
                so.getPurchaseOrder() != null && so.getPurchaseOrder().getDeliveryDate() != null ? so.getPurchaseOrder().getDeliveryDate().toString() : "--"
        );
    }
}
