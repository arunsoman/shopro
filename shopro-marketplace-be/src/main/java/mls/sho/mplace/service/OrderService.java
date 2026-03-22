package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
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

        // Approval Logic
        if (total.compareTo(new BigDecimal("5000")) > 0) {
            savedPo.setStatus(PurchaseOrder.POStatus.PENDING_APPROVAL);
            savedPo.setApprovalRequired(true);
            savedPo.setApprovalStatus(PurchaseOrder.ApprovalStatus.PENDING);
        } else {
            savedPo.setStatus(PurchaseOrder.POStatus.ACCEPTED);
            savedPo.setApprovalRequired(false);
            savedPo.setApprovalStatus(PurchaseOrder.ApprovalStatus.NOT_REQUIRED);
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

        return poRepository.saveAndFlush(savedPo);
    }

    @Transactional
    public void updateSubOrderStatus(UUID subOrderId, String status) {
        SubOrder so = subOrderRepository.findById(subOrderId)
                .orElseThrow(() -> new RuntimeException("SubOrder not found"));
        so.setStatus(SubOrder.SubOrderStatus.valueOf(status));
        subOrderRepository.save(so);
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
                return subOrderRepository.save(so);
            });

            item.setSubOrder(subOrder);
            subOrder.setTotalAmount(subOrder.getTotalAmount().add(item.getPriceAtOrder().multiply(item.getQuantity())));
            orderItemRepository.save(item);
        }

        po.setStatus(PurchaseOrder.POStatus.SPLIT_COMPLETE);
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

        return new PurchaseOrderDto(
                po.getId(),
                po.getReferenceNumber(),
                restaurantName,
                po.getTotalAmount(),
                po.getStatus().name(),
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
                items
        );
    }

    private SubOrderDetailsDto mapToDetailsDto(SubOrder so) {
        return new SubOrderDetailsDto(
                so.getId(),
                "SPO-" + so.getId().toString().substring(0, 8).toUpperCase(),
                so.getPurchaseOrder() != null ? so.getPurchaseOrder().getReferenceNumber() : "Unknown",
                so.getSupplier() != null ? so.getSupplier().getName() : "Unknown",
                so.getTotalAmount(),
                so.getStatus().name(),
                so.getCreatedAt(),
                so.getPurchaseOrder() != null && so.getPurchaseOrder().getDeliveryDate() != null ? so.getPurchaseOrder().getDeliveryDate().toString() : "--"
        );
    }
}
