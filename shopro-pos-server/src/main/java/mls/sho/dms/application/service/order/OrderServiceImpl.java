package mls.sho.dms.application.service.order;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.order.*;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.dto.floor.TableShapeResponse;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.ModifierOption;
import mls.sho.dms.entity.order.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.menu.ModifierOptionRepository;
import mls.sho.dms.repository.order.*;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.service.edp.EdpPublisher;
import mls.sho.dms.application.service.inventory.RecipeService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.util.ArrayList;
import mls.sho.dms.service.kds.KDSService;
import mls.sho.dms.application.service.staff.StaffService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.05");
    private static final UUID DEFAULT_VENUE_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final OrderTicketRepository orderTicketRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemModifierRepository orderItemModifierRepository;
    private final MenuItemRepository menuItemRepository;
    private final ModifierOptionRepository modifierOptionRepository;
    private final TableShapeRepository tableShapeRepository;
    private final StaffRepository staffMemberRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final mls.sho.dms.application.service.crm.LoyaltyService loyaltyService;
    private final RecipeService recipeService;
    private final KDSService kdsService;
    private final StaffService staffService;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final mls.sho.dms.application.service.core.NotificationEngine notificationEngine;
    private final EdpPublisher edpPublisher;
    private final SimpMessagingTemplate messagingTemplate;

    // Advanced Tax Integration (Legacy dependency removed as per user module request)
    private final mls.sho.dms.tax.repository.VenueCountryAssignmentRepository venueCountryAssignmentRepository;
    private final mls.sho.dms.tax.repository.TaxCalculationResultRepository taxCalculationResultRepository;
    private final mls.sho.dms.tax.repository.TaxRuleRepository taxRuleRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String performedBy) {
        StaffMember server = staffMemberRepository.findByFullName(performedBy)
            .orElseThrow(() -> new ResourceNotFoundException("Server not found: " + performedBy));

        OrderTicket ticket = new OrderTicket();
        ticket.setOrderType(request.orderType());
        ticket.setServer(server);
        ticket.setCoverCount(request.coverCount());
        ticket.setStatus(TicketStatus.OPEN);

        if (request.orderType() == OrderType.DINE_IN) {
            TableShape table = tableShapeRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + request.tableId()));
            ticket.setTable(table);
            
            // US-4.1: AVAILABLE -> OCCUPIED on new order
            if (table.getStatus() == mls.sho.dms.entity.floor.TableStatus.AVAILABLE) {
                table.setStatus(mls.sho.dms.entity.floor.TableStatus.OCCUPIED);
                tableShapeRepository.save(table);

                // Notify Servers
                notificationEngine.sendNotification(
                    "TABLE_OCCUPIED",
                    "Table Seated: " + table.getName(),
                    "Guests have been seated at " + table.getName() + " (" + request.coverCount() + " pax).",
                    java.util.Map.of("tableId", table.getId().toString(), "tableName", table.getName()),
                    "TABLE_OCCUPIED_" + table.getId()
                );
            }
        } else if (request.orderType() == OrderType.DELIVERY) {
            if (request.deliveryAddress() == null || request.deliveryAddress().isBlank()) {
                throw new IllegalArgumentException("Delivery address is required for Delivery orders.");
            }
            ticket.setDeliveryAddress(request.deliveryAddress());
        } else if (request.orderType() == OrderType.CURBSIDE) {
            ticket.setVehicleModel(request.vehicleModel());
            ticket.setVehicleColor(request.vehicleColor());
            ticket.setVehiclePlate(request.vehiclePlate());
        }

        if (request.customerProfileId() != null) {
            CustomerProfile customer = customerProfileRepository.findById(request.customerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + request.customerProfileId()));
            ticket.setCustomerProfile(customer);
        }

        ticket = orderTicketRepository.save(ticket);
        recordAuditLog(ticket, "ORDER_CREATED", "Order started for " + request.orderType(), server);
        
        // Emit EDP event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("orderId", ticket.getId());
        eventData.put("tableId", ticket.getTable() != null ? ticket.getTable().getId() : null);
        eventData.put("type", ticket.getOrderType().name());
        eventData.put("serverId", server.getId());
        edpPublisher.publish("order.created", eventData);

        if (ticket.getTable() != null) {
            broadcastTableUpdate(ticket.getTable());
        }

        OrderResponse response = mapToResponse(ticket);
        messagingTemplate.convertAndSend("/topic/orders", response);
        return response;
    }

    private void checkModifiable(OrderTicket ticket) {
        if (ticket.getStatus() == TicketStatus.PAID || ticket.getStatus() == TicketStatus.VOIDED) {
            throw new IllegalStateException("Order is already " + ticket.getStatus());
        }
        // Requirement AC 2.6: No split orders can be modified
        // An order is split if it has a parent or if it has sub-tickets
        boolean isSplit = ticket.getParentTicket() != null || !orderTicketRepository.findByParentTicket(ticket).isEmpty();
        if (isSplit || ticket.getStatus() == TicketStatus.PARTIALLY_PAID) {
             throw new IllegalStateException("Cannot cancel or void items in an order with active splits/partial payments. Revert splits first.");
        }
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String performedBy, String managerPin) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        checkModifiable(ticket);

        boolean allNew = kdsService.areAllTicketsNew(orderId);
        if (!allNew) {
            if (managerPin == null || !staffService.validateManagerPin(managerPin)) {
                throw new mls.sho.dms.application.exception.BusinessRuleException("Chef has started cooking. Manager override required to cancel this order.");
            }
            log.info("Manager override used to cancel cooking order: {}", orderId);
        }

        ticket.setStatus(TicketStatus.VOIDED);
        kdsService.cancelKDSTickets(orderId);
        
        // Null-safe table transition
        if (ticket.getTable() != null) {
            ticket.getTable().setStatus(mls.sho.dms.entity.floor.TableStatus.DIRTY);
            tableShapeRepository.save(ticket.getTable());
            broadcastTableUpdate(ticket.getTable());
        }

        OrderTicket saved = orderTicketRepository.save(ticket);
        recordAuditLog(saved, "ORDER_CANCELLED", "Order cancelled by " + performedBy, null);
        
        // Emit EDP event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("orderId", saved.getId());
        eventData.put("reason", "Order voided");
        eventData.put("performedBy", performedBy);
        edpPublisher.publish("order.cancel", eventData);

        OrderResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, "REFRESH");
        return response;
    }

    @Override
    @Transactional
    public OrderResponse voidOrderItem(UUID orderId, UUID itemId, String reason, String performedBy, String managerPin) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        checkModifiable(ticket);

        if (item.getStatus() == OrderItemStatus.VOIDED) {
            throw new IllegalStateException("Item is already voided");
        }

        boolean isPending = kdsService.isItemPendingInKDS(itemId);
        boolean isUnsubmitted = item.getStatus() == mls.sho.dms.entity.order.OrderItemStatus.PENDING;

        if (isUnsubmitted) {
            // Permanent deletion for unsubmitted items
            ticket.getItems().remove(item);
            orderItemRepository.delete(item);
            log.info("Deleting unsubmitted item {} from order {}", itemId, orderId);
        } else {
            if (!isPending) {
                if (managerPin == null || !staffService.validateManagerPin(managerPin)) {
                    throw new mls.sho.dms.application.exception.BusinessRuleException("Preparation has started. Manager override required to void this item.");
                }
                log.info("Manager override used to void cooking item: {} (Reason: {})", itemId, reason);
            }
            item.setStatus(mls.sho.dms.entity.order.OrderItemStatus.VOIDED);
            orderItemRepository.save(item);
            kdsService.voidItemInKDS(itemId);
        }
        
        recalculateTicket(ticket);
        OrderTicket saved = orderTicketRepository.save(ticket);
        
        recordAuditLog(saved, "ITEM_VOIDED", "Item " + item.getMenuItem().getName() + " voided. Reason: " + reason, null);
        
        // Emit EDP event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("orderId", orderId);
        eventData.put("orderItemId", itemId);
        eventData.put("reason", reason);
        eventData.put("performedBy", performedBy);
        edpPublisher.publish("order.item_void", eventData);
        
        OrderResponse response = mapToResponse(saved);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, "REFRESH");
        return response;
    }

    @Override
    @Transactional
    public OrderResponse addOrderItem(UUID orderId, AddOrderItemRequest request) {
        log.warn("=== ADD ITEM REQUEST ===");
        log.warn("Order: {}", orderId);
        log.warn("Item: {}", request.menuItemId());
        log.warn("Mods: {}", request.modifierOptionIds());
        log.warn("Note: {}", request.customNote());
        
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        MenuItem menuItem = menuItemRepository.findById(request.menuItemId())
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + request.menuItemId()));

        OrderItem item = new OrderItem();
        item.setTicket(ticket);
        item.setMenuItem(menuItem);
        item.setQuantity(request.quantity());
        item.setUnitPrice(menuItem.getBasePrice());
        
        // Added Auto-coursing logic (US-3.7)
        int course = (request.courseNumber() != null) ? request.courseNumber() : 
                     (menuItem.getCategory().getDefaultCourse() != null ? menuItem.getCategory().getDefaultCourse() : 1);
        item.setCourseNumber(course);
        // Force status to PENDING regardless of course for the moment to ensure visibility.
        item.setStatus(OrderItemStatus.PENDING);
        
        item.setCustomNote(request.customNote());
        item.setHasAllergyFlag(request.hasAllergyFlag());

        log.debug("Adding item {} to order {} with quantity {}", menuItem.getName(), orderId, request.quantity());
        item = orderItemRepository.save(item);

        BigDecimal modifierTotal = BigDecimal.ZERO;
        if (request.modifierOptionIds() != null && !request.modifierOptionIds().isEmpty()) {
            for (UUID optId : request.modifierOptionIds()) {
                ModifierOption option = modifierOptionRepository.findById(optId)
                    .orElseThrow(() -> new ResourceNotFoundException("Modifier option not found: " + optId));
                
                OrderItemModifier mod = new OrderItemModifier();
                mod.setOrderItem(item);
                mod.setModifierOption(option);
                mod.setUpchargeAmount(option.getUpchargeAmount());
                orderItemModifierRepository.save(mod);
                
                modifierTotal = modifierTotal.add(option.getUpchargeAmount());
            }
        }
        item.setModifierUpchargeTotal(modifierTotal);
        orderItemRepository.save(item);

        recalculateTicket(ticket);
        OrderResponse result = findById(orderId);
        log.warn("Returning {} items. New item ID is {}", result.items().size(), item.getId());
        
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, result);
        return result;
    }

    @Override
    @Transactional
    public OrderResponse updateItemQuantity(UUID orderId, UUID itemId, int newQuantity) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order found: " + orderId));

        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Order item not found: " + itemId));

        int oldQuantity = item.getQuantity();

        if (newQuantity <= 0) {
            return voidOrderItem(orderId, itemId, "Quantity reduced to 0", "STAFF", null);
        } else if (newQuantity < oldQuantity) {
            // US-5.1: Partial decrement check
            if (item.getStatus() != OrderItemStatus.PENDING) {
                int delta = oldQuantity - newQuantity;
                int removable = kdsService.getRemovableQuantity(itemId);
                
                if (delta > removable) {
                    throw new mls.sho.dms.application.exception.BusinessRuleException(
                        "Cannot remove " + delta + " units. Only " + removable + " units are still pending in the kitchen."
                    );
                }
                
                log.info("Partial decrement for sent item: {} ({} -> {}). Removing {} targeted KDS units.", 
                    itemId, oldQuantity, newQuantity, delta);
                
                // Stack-based decrement Logic: Target specific unitIndices
                for (int i = 0; i < delta; i++) {
                    int unitIndexToRemove = oldQuantity - i;
                    
                    // Directly call KDS service for immediate sync
                    kdsService.decrementSpecificUnit(itemId, unitIndexToRemove, null);
                    
                    // Publish EDP event for formal audit and catch-up
                    edpPublisher.publish("order.item_decrement", Map.of(
                        "orderId", orderId,
                        "orderItemId", itemId,
                        "unitIndex", unitIndexToRemove,
                        "menuItemId", item.getMenuItem().getId(),
                        "quantity", 1
                    ));
                }
            }
        }

        item.setQuantity(newQuantity);
        orderItemRepository.save(item);

        recalculateTicket(ticket);
        OrderResponse response = findById(orderId);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        return response;
    }

    @Override
    @Transactional
    public OrderResponse sendToKitchen(UUID orderId) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        List<OrderItem> pendingItems = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED)
            .stream()
            .filter(i -> i.getStatus() == OrderItemStatus.PENDING)
            .collect(Collectors.toList());

        for (OrderItem item : pendingItems) {
            item.setStatus(OrderItemStatus.SENT);
            orderItemRepository.save(item);
            
            // US-5.1: Real-time Inventory Depletion
            recipeService.depleteForOrderItem(item);
            
            // Financial: Handled via EDP (order.fire triggers COGS)
            
            // EDP: Publish independent unit-level events for granular tracking (US-5.1)
            int totalQuantity = item.getQuantity();
            for (int i = 1; i <= totalQuantity; i++) {
                edpPublisher.publish("order.fire", Map.of(
                    "orderId", orderId,
                    "orderItemId", item.getId(),
                    "unitIndex", i,
                    "menuItemId", item.getMenuItem().getId(),
                    "quantity", 1
                ));
            }
        }

        if (!pendingItems.isEmpty()) {
            log.debug("Found {} pending items to send to kitchen for order {}", pendingItems.size(), orderId);
            ticket.setStatus(TicketStatus.SUBMITTED);
            orderTicketRepository.save(ticket);
            
            // US-4.1: OCCUPIED -> ORDER_PLACED on first submission
            if (ticket.getTable() != null && ticket.getTable().getStatus() == mls.sho.dms.entity.floor.TableStatus.OCCUPIED) {
                TableShape table = ticket.getTable();
                table.setStatus(mls.sho.dms.entity.floor.TableStatus.ORDER_PLACED);
                tableShapeRepository.save(table);
                broadcastTableUpdate(table);
            }
            
            recordAuditLog(ticket, "KITCHEN_SENT", "Items sent to kitchen: " + pendingItems.size(), ticket.getServer());
        }

        OrderResponse response = findById(orderId);
        // WS broadcasting is now handled by WebSocketRelayConsumer via EdpPublisher
        return response;
    }

    @Override
    @Transactional
    public OrderResponse fireCourse(UUID orderId, int courseNumber) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        List<OrderItem> courseItems = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED)
            .stream()
            .filter(i -> i.getCourseNumber() == courseNumber && i.getStatus() == OrderItemStatus.HELD)
            .collect(Collectors.toList());

        if (courseItems.isEmpty()) {
            log.debug("No held items found for course {} in order {}", courseNumber, orderId);
            return findById(orderId);
        }

        log.debug("Firing course {} for order {} ({} items)", courseNumber, orderId, courseItems.size());
        for (OrderItem item : courseItems) {
            item.setStatus(OrderItemStatus.SENT);
            item.setFiredAt(java.time.Instant.now());
            orderItemRepository.save(item);
            recipeService.depleteForOrderItem(item);
        }

        kdsService.routeOrder(ticket, courseItems);
        recordAuditLog(ticket, "COURSE_FIRED", "Course #" + courseNumber + " fired to kitchen", ticket.getServer());
        
        OrderResponse response = findById(orderId);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        return response;
    }

    @Override
    public OrderResponse findById(UUID id) {
        OrderTicket ticket = orderTicketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public OrderResponse applyDiscount(UUID orderId, BigDecimal amount, boolean isPercentage, String managerPin) {
        // TODO: Implement Manager PIN validation
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        BigDecimal discount;
        if (isPercentage) {
            discount = ticket.getSubtotal().multiply(amount).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        } else {
            discount = amount;
        }
        ticket.setDiscountAmount(discount);
        recalculateTicket(ticket);
        recordAuditLog(ticket, "DISCOUNT_APPLIED", (isPercentage ? amount + "%" : "$" + amount) + " discount applied", ticket.getServer());
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public OrderResponse finalizeOrder(UUID orderId) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (ticket.getStatus() == TicketStatus.PAID) {
            throw new IllegalStateException("Order is already paid.");
        }

        ticket.setStatus(TicketStatus.PAID);
        ticket.setPaidAt(java.time.Instant.now());
        recordAuditLog(ticket, "ORDER_PAID", "Order finalized and paid", ticket.getServer());
        
        // Process Loyalty Points
        if (ticket.getCustomerProfile() != null) {
            loyaltyService.earnPoints(ticket.getCustomerProfile().getId(), ticket.getSubtotal(), ticket.getId());
        }

        // US-2.4: Transition table to DIRTY upon payment
        if (ticket.getTable() != null) {
            TableShape table = ticket.getTable();
            table.setStatus(mls.sho.dms.entity.floor.TableStatus.DIRTY);
            tableShapeRepository.save(table);

            // Notify Bussers
            notificationEngine.sendNotification(
                "TABLE_DIRTY",
                "Table Dirty: " + table.getName(),
                "Table " + table.getName() + " is now dirty and needs cleaning.",
                java.util.Map.of("tableId", table.getId().toString(), "tableName", table.getName()),
                "TABLE_DIRTY_" + table.getId()
            );
        }

        orderTicketRepository.save(ticket);
        
        // Emit EDP event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("orderId", ticket.getId());
        eventData.put("totalAmount", ticket.getTotalAmount());
        eventData.put("taxAmount", ticket.getTaxAmount());
        eventData.put("paymentMethod", "CASH"); 
        edpPublisher.publish("order.payment_completed", eventData);
        
        // Financial: Handled via EDP

        OrderResponse response = mapToResponse(ticket);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        
        if (ticket.getTable() != null) {
            broadcastTableUpdate(ticket.getTable());
        }
        
        return response;
    }

    @Override
    @Transactional
    public OrderResponse markAsServed(UUID orderId) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (ticket.getStatus() != TicketStatus.READY && ticket.getStatus() != TicketStatus.SUBMITTED) {
            log.warn("Attempted to mark order {} as served while in status {}", orderId, ticket.getStatus());
        }

        ticket.setStatus(TicketStatus.SERVED);

        // Update individual items to DELIVERED (US-4.3)
        List<OrderItem> items = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED);
        for (OrderItem item : items) {
            if (item.getStatus() != OrderItemStatus.DELIVERED) {
                item.setStatus(OrderItemStatus.DELIVERED);
                orderItemRepository.save(item);
            }
        }

        recordAuditLog(ticket, "ORDER_SERVED", "Order items delivered to guest. " + items.size() + " items marked as delivered.", ticket.getServer());
        
        if (ticket.getTable() != null) {
            TableShape table = ticket.getTable();
            // Only transition if it's currently ORDER_PLACED or ORDERED
            if (table.getStatus() == mls.sho.dms.entity.floor.TableStatus.ORDER_PLACED || 
                table.getStatus() == mls.sho.dms.entity.floor.TableStatus.ORDERED) {
                table.setStatus(mls.sho.dms.entity.floor.TableStatus.FOOD_DELIVERED);
                tableShapeRepository.save(table);
                broadcastTableUpdate(table);
            }
        }

        ticket = orderTicketRepository.save(ticket);
        OrderResponse response = mapToResponse(ticket);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        return response;
    }

    @Override
    public List<OrderResponse> getActiveOrders() {
        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.SUBMITTED, TicketStatus.READY, TicketStatus.SERVED, TicketStatus.PARTIALLY_PAID);
        log.debug("Fetching active orders with statuses: {}", activeStatuses);
        return orderTicketRepository.findByStatusInOrderByCreatedAtDesc(activeStatuses)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID orderId, TicketStatus status) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        log.debug("Updating order {} status from {} to {}", orderId, ticket.getStatus(), status);
        ticket.setStatus(status);
        if (status == TicketStatus.PAID) {
            ticket.setPaidAt(java.time.Instant.now());
        }
        ticket = orderTicketRepository.save(ticket);
        OrderResponse response = mapToResponse(ticket);
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        return response;
    }

    private void recalculateTicket(OrderTicket ticket) {
        List<OrderItem> items = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED);
        
        BigDecimal subtotal = items.stream()
            .map(i -> (i.getUnitPrice().add(i.getModifierUpchargeTotal())).multiply(new BigDecimal(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        ticket.setSubtotal(subtotal);
        
        // Explicit Tax Validation (PRD Section 7)
        try {
            // 1. Resolve active jurisdiction
            UUID venueId = DEFAULT_VENUE_ID; 
            mls.sho.dms.tax.entity.Country country = venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(venueId)
                .orElseThrow(() -> new mls.sho.dms.application.exception.TaxNotConfiguredException(
                    "Taxation not configured for this venue. Please assign a country in Taxes & Compliance."))
                .getCountry();

            // 2. Fetch all active rules with overrides
            List<Object[]> ruleData = taxRuleRepository.findActiveRulesWithOverridesForVenue(venueId);
            if (ruleData.isEmpty()) {
                throw new mls.sho.dms.application.exception.TaxNotConfiguredException(
                    "No active tax rules found for this jurisdiction (" + country.getName() + "). Please configure tax rules.");
            }
            
            // 3. Clear previous results
            taxCalculationResultRepository.deleteByTicketId(ticket.getId());

            BigDecimal totalTax = BigDecimal.ZERO;
            
            for (OrderItem item : items) {
                BigDecimal itemBaseAmount = (item.getUnitPrice().add(item.getModifierUpchargeTotal()))
                    .multiply(new BigDecimal(item.getQuantity()));
                
                TaxParameters params = deduceTaxParameters(item.getMenuItem());
                
                // 4. Resolve applicable rules for this item
                boolean itemTaxed = false;
                for (Object[] row : ruleData) {
                    mls.sho.dms.tax.entity.TaxRule rule = (mls.sho.dms.tax.entity.TaxRule) row[0];
                    mls.sho.dms.tax.entity.VenueTaxConfig override = (mls.sho.dms.tax.entity.VenueTaxConfig) row[1];
                    
                    if (isRuleApplicable(rule, item, ticket.getOrderType().name(), params)) {
                        itemTaxed = true;
                        BigDecimal rate = (override != null) ? override.getOverrideRate() : rule.getDefaultRate();
                        BigDecimal tax;
                        
                        if (country.isTaxIncluded()) {
                            // Net = Gross / (1 + rate)
                            BigDecimal net = itemBaseAmount.divide(BigDecimal.ONE.add(rate), 4, RoundingMode.HALF_UP);
                            tax = itemBaseAmount.subtract(net).setScale(2, RoundingMode.HALF_UP);
                        } else {
                            tax = itemBaseAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                        }

                        // 5. Persist breakdown
                        mls.sho.dms.tax.entity.TaxCalculationResult entity = new mls.sho.dms.tax.entity.TaxCalculationResult();
                        entity.setTicketId(ticket.getId());
                        entity.setTicketItemId(item.getId());
                        entity.setTaxRule(rule);
                        entity.setRuleCode(rule.getRuleCode());
                        entity.setBaseAmount(itemBaseAmount);
                        entity.setTaxRate(rate);
                        entity.setTaxAmount(tax);
                        entity.setOrderType(ticket.getOrderType().name());
                        
                        taxCalculationResultRepository.save(entity);
                        totalTax = totalTax.add(tax);
                    }
                }

                // If a non-exempt item has no applicable tax, we throw to prevent silent non-taxation
                // Note: In real world, some items might be truly tax-free, but per USER request we enforce configuration.
                if (!itemTaxed) {
                    log.warn("Item {} has no applicable tax rules in {}", item.getMenuItem().getName(), country.getName());
                    // For now, only warn or throw if user wants absolute strictness.
                    // Given the user's prompt "why should the system run without taxation not enabled", we'll be strict.
                    throw new mls.sho.dms.application.exception.TaxNotConfiguredException(
                        "No applicable tax rule found for item: " + item.getMenuItem().getName());
                }
            }

            ticket.setTaxAmount(totalTax);
            ticket.setTotalAmount(subtotal.subtract(ticket.getDiscountAmount()).add(totalTax).add(ticket.getTipAmount()));
            
        } catch (mls.sho.dms.application.exception.TaxNotConfiguredException e) {
            // Re-throw our specific configuration exception to be handled by GlobalExceptionHandler
            throw e;
        } catch (Exception e) {
            log.error("Advanced Tax Calculation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Tax calculation error: " + e.getMessage(), e);
        }
        
        orderTicketRepository.save(ticket);
    }

    private record TaxParameters(String category, String temperature) {}

    private boolean isRuleApplicable(mls.sho.dms.tax.entity.TaxRule rule, OrderItem item, String orderType, TaxParameters params) {
        // Order Type
        if ("DINE_IN".equals(orderType) && !rule.isAppliesToDineIn()) return false;
        if ("TAKEAWAY".equals(orderType) && !rule.isAppliesToTakeaway()) return false;
        
        // Temperature
        if (Boolean.TRUE.equals(rule.getAppliesToHot()) && !"HOT".equals(params.temperature())) return false;
        if (Boolean.TRUE.equals(rule.getAppliesToCold()) && !"COLD".equals(params.temperature())) return false;
        if (Boolean.FALSE.equals(rule.getAppliesToHot()) && "HOT".equals(params.temperature())) return false;
        if (Boolean.FALSE.equals(rule.getAppliesToCold()) && "COLD".equals(params.temperature())) return false;

        // Category
        if (rule.getItemCategory() != null && !rule.getItemCategory().equals(params.category())) return false;
        if (rule.isAppliesToAlcohol() && !"ALCOHOL".equals(params.category())) return false;

        // Price Thresholds
        BigDecimal unitPrice = item.getUnitPrice();
        if (rule.getPriceThresholdMin() != null && unitPrice.compareTo(rule.getPriceThresholdMin()) < 0) return false;
        if (rule.getPriceThresholdMax() != null && unitPrice.compareTo(rule.getPriceThresholdMax()) >= 0) return false;

        return true;
    }

    private TaxParameters deduceTaxParameters(MenuItem item) {
        String categoryName = item.getCategory() != null ? item.getCategory().getName().toUpperCase() : "UNKNOWN";
        String itemName = item.getName() != null ? item.getName().toUpperCase() : "UNKNOWN";
        
        String itemCategory = "FOOD";
        if (categoryName.contains("DRINK") || categoryName.contains("BEVERAGE") || itemName.contains("JUICE") || itemName.contains("SODA")) {
            itemCategory = "BEVERAGE";
        } else if (categoryName.contains("ALCOHOL") || itemName.contains("BEER") || itemName.contains("WINE") || itemName.contains("WHISKY")) {
            itemCategory = "ALCOHOL";
        }
        
        String temperature = "COLD";
        if (categoryName.contains("HOT") || itemName.contains("TEA") || itemName.contains("COFFEE") || itemName.contains("SOUP") || itemName.contains("STEAK") || itemName.contains("BURGER")) {
            temperature = "HOT";
        }
        
        return new TaxParameters(itemCategory, temperature);
    }

    private OrderResponse mapToResponse(OrderTicket ticket) {
        List<OrderItem> items = orderItemRepository.findByTicketOrderByCreatedAtAsc(ticket);
        List<OrderItemResponse> itemResponses = items.stream()
            .map(this::mapToItemResponse)
            .collect(Collectors.toList());

        List<OrderAuditLog> auditLogs = orderAuditLogRepository.findByOrderOrderByCreatedAtAsc(ticket);
        List<OrderAuditResponse> auditResponses = auditLogs.stream()
            .map(log -> new OrderAuditResponse(
                log.getId(),
                log.getEventType(),
                log.getDetails(),
                log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "SYSTEM",
                log.getCreatedAt()
            ))
            .collect(Collectors.toList());

        List<mls.sho.dms.tax.entity.TaxCalculationResult> taxResults = taxCalculationResultRepository.findByTicketId(ticket.getId());
        java.util.Map<String, BigDecimal> taxSummary = taxResults.stream()
            .collect(Collectors.groupingBy(
                mls.sho.dms.tax.entity.TaxCalculationResult::getRuleCode,
                Collectors.reducing(BigDecimal.ZERO, mls.sho.dms.tax.entity.TaxCalculationResult::getTaxAmount, BigDecimal::add)
            ));


        return new OrderResponse(
            ticket.getId(),
            ticket.getId().toString().substring(0, 8).toUpperCase(), // Simplified order number
            ticket.getStatus(),
            ticket.getOrderType(),
            ticket.getTable() != null ? ticket.getTable().getId() : null,
            ticket.getTable() != null ? ticket.getTable().getName() : null,
            ticket.getServer().getId(),
            ticket.getServer().getFullName(),
            ticket.getCustomerProfile() != null ? ticket.getCustomerProfile().getId() : null,
            ticket.getCustomerProfile() != null ? (ticket.getCustomerProfile().getFirstName() + " " + ticket.getCustomerProfile().getLastName()) : null,
            ticket.getDeliveryAddress(),
            ticket.getCoverCount(),
            ticket.getSubtotal(),
            ticket.getTaxAmount(),
            ticket.getTipAmount(),
            ticket.getDiscountAmount(),
            ticket.getTotalAmount(),
            ticket.getVehicleModel(),
            ticket.getVehicleColor(),
            ticket.getVehiclePlate(),
            itemResponses,
            auditResponses,
            ticket.getCreatedAt(),
            ticket.getPaidAt(),
            taxSummary,
            ticket.getStatus() != TicketStatus.PAID && ticket.getStatus() != TicketStatus.VOIDED && kdsService.areAllTicketsNew(ticket.getId())
        );
    }

    private void recordAuditLog(OrderTicket order, String eventType, String details, StaffMember performedBy) {
        OrderAuditLog auditLog = new OrderAuditLog(order, eventType, details, performedBy);
        
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String jkt = (String) request.getAttribute("bound_dpop_jkt");
                auditLog.setDeviceJkt(jkt);
                
                String dpop = request.getHeader("DPoP");
                if (dpop != null) {
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    byte[] hash = digest.digest(dpop.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    auditLog.setSignatureHash(java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to capture FAPI audit metadata: {}", e.getMessage());
        }
        
        orderAuditLogRepository.save(auditLog);
    }

    private OrderItemResponse mapToItemResponse(OrderItem item) {
        List<OrderItemModifier> modifiers = orderItemModifierRepository.findByOrderItem(item);
        List<OrderItemModifierResponse> modifierResponses = modifiers.stream()
            .map(m -> new OrderItemModifierResponse(
                m.getId(),
                m.getModifierOption().getId(),
                m.getModifierOption().getLabel(),
                m.getUpchargeAmount()
            ))
            .collect(Collectors.toList());

        BigDecimal lineTotal = (item.getUnitPrice().add(item.getModifierUpchargeTotal()))
            .multiply(new BigDecimal(item.getQuantity()));

        List<mls.sho.dms.tax.entity.TaxCalculationResult> itemTaxResults = taxCalculationResultRepository.findByTicketItemId(item.getId());
        List<mls.sho.dms.tax.dto.response.TaxBreakdownEntry> itemTaxBreakdowns = itemTaxResults.stream()
            .map(r -> new mls.sho.dms.tax.dto.response.TaxBreakdownEntry(
                r.getRuleCode(),
                r.getTaxRule() != null ? r.getTaxRule().getRuleName() : r.getRuleCode(),
                r.getTaxRate(),
                r.getTaxAmount()
            ))
            .collect(Collectors.toList());

        return new OrderItemResponse(
            item.getId(),
            item.getMenuItem().getId(),
            item.getMenuItem().getName(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getModifierUpchargeTotal(),
            lineTotal,
            item.getStatus(),
            item.getCustomNote(),
            item.isHasAllergyFlag(),
            item.isSubtraction(),
            item.getCourseNumber(),
            item.getFiredAt(),
            modifierResponses,
            itemTaxBreakdowns,
            item.getStatus() != OrderItemStatus.VOIDED && kdsService.isItemPendingInKDS(item.getId()),
            item.getStatus() == OrderItemStatus.PENDING ? item.getQuantity() : kdsService.getRemovableQuantity(item.getId())
        );
    }

    @Override
    public List<OrderResponse> searchOrders(
            String orderId,
            String tableName,
            java.time.Instant startDate,
            java.time.Instant endDate,
            String serverName
    ) {
        List<OrderTicket> tickets = orderTicketRepository.searchHistory(
            orderId, tableName, startDate, endDate, serverName, 
            List.of(TicketStatus.PAID, TicketStatus.VOIDED),
            PageRequest.of(0, 10)
        );
        return tickets.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateTicketStatusFromItems(UUID ticketId) {
        OrderTicket ticket = orderTicketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + ticketId));

        if (ticket.getStatus() == TicketStatus.PAID || ticket.getStatus() == TicketStatus.VOIDED) {
            return mapToResponse(ticket);
        }

        List<OrderItem> items = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED);
        if (items.isEmpty()) {
            return mapToResponse(ticket);
        }

        boolean allDelivered = items.stream().allMatch(i -> i.getStatus() == OrderItemStatus.DELIVERED);
        boolean allReadyOrDelivered = items.stream().allMatch(i -> i.getStatus() == OrderItemStatus.READY || i.getStatus() == OrderItemStatus.DELIVERED);
        boolean anySentOrReady = items.stream().anyMatch(i -> i.getStatus() == OrderItemStatus.SENT || i.getStatus() == OrderItemStatus.READY || i.getStatus() == OrderItemStatus.DELIVERED);

        TicketStatus newStatus = ticket.getStatus();
        if (allDelivered) {
            newStatus = TicketStatus.SERVED;
        } else if (allReadyOrDelivered) {
            newStatus = TicketStatus.READY;
        } else if (anySentOrReady) {
            newStatus = TicketStatus.SUBMITTED;
        }

        if (newStatus != ticket.getStatus()) {
            log.info("Transitioning ticket {} status from {} to {} based on items", ticketId, ticket.getStatus(), newStatus);
            ticket.setStatus(newStatus);
            
            // Handle Table Status transition if it became SERVED
            if (newStatus == TicketStatus.SERVED && ticket.getTable() != null) {
                TableShape table = ticket.getTable();
                if (table.getStatus() == mls.sho.dms.entity.floor.TableStatus.ORDER_PLACED || 
                    table.getStatus() == mls.sho.dms.entity.floor.TableStatus.ORDERED) {
                    table.setStatus(mls.sho.dms.entity.floor.TableStatus.FOOD_DELIVERED);
                    tableShapeRepository.save(table);
                    broadcastTableUpdate(table);
                }
            }
            
            orderTicketRepository.save(ticket);
            recordAuditLog(ticket, "TICKET_AUTO_UPDATE", "Status automatically updated to " + newStatus, null);
            
            OrderResponse response = mapToResponse(ticket);
            messagingTemplate.convertAndSend("/topic/orders/" + ticketId, response);
            return response;
        }

        return mapToResponse(ticket);
    }

    private void broadcastTableUpdate(TableShape table) {
        TableShapeResponse tableResponse = new TableShapeResponse(
             table.getId(),
             table.getName(),
             table.getCapacity(),
             table.getStatus().name(),
             table.getSection().getId(),
             table.getSection().getName(),
             table.getPosX(),
             table.getPosY(),
             table.getWidth(),
             table.getHeight(),
             table.getShapeType(),
             table.getAssignedStaff() != null ? table.getAssignedStaff().getId() : null,
             table.getAssignedStaff() != null ? table.getAssignedStaff().getFullName() : null
        );
        messagingTemplate.convertAndSend("/topic/tables", tableResponse);
    }

    @Override
    @Transactional
    public void processConfirmedDecrement(UUID orderId, UUID orderItemId, int quantityToSubstract) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order found: " + orderId));

        OrderItem item = orderItemRepository.findById(orderItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Order item not found: " + orderItemId));

        int newQuantity = item.getQuantity() - quantityToSubstract;
        
        if (newQuantity <= 0) {
            voidOrderItem(orderId, orderItemId, "Confirmed KDS decrement", "SYSTEM", null);
        } else {
            item.setQuantity(newQuantity);
            orderItemRepository.save(item);
            recalculateTicket(ticket);
            
            OrderResponse response = findById(orderId);
            messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
        }
    }
}
