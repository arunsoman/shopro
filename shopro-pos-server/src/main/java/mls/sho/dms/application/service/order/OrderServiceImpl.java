package mls.sho.dms.application.service.order;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.order.*;
import mls.sho.dms.application.exception.ResourceNotFoundException;
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
import mls.sho.dms.repository.staff.StaffMemberRepository;
import mls.sho.dms.application.service.inventory.RecipeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.05");

    private final OrderTicketRepository orderTicketRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemModifierRepository orderItemModifierRepository;
    private final MenuItemRepository menuItemRepository;
    private final ModifierOptionRepository modifierOptionRepository;
    private final TableShapeRepository tableShapeRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final mls.sho.dms.application.service.crm.LoyaltyService loyaltyService;
    private final RecipeService recipeService;
    private final mls.sho.dms.service.kds.KDSService kdsService;
    private final OrderAuditLogRepository orderAuditLogRepository;

    @Override
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
        return mapToResponse(ticket);
    }

    @Override
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
        return result;
    }

    @Override
    public OrderResponse updateItemQuantity(UUID orderId, UUID itemId, int newQuantity) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Order item not found: " + itemId));

        if (newQuantity <= 0) {
            orderItemRepository.delete(item);
        } else {
            item.setQuantity(newQuantity);
            orderItemRepository.save(item);
        }

        recalculateTicket(ticket);
        return findById(orderId);
    }

    @Override
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
            recipeService.depleteForOrderItem(item); // Real-time stock depletion
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
            }
            
            // Route the items to KDS stations
            log.debug("Handing off {} items to KDSService for routing", pendingItems.size());
            kdsService.routeOrder(ticket, pendingItems);
            recordAuditLog(ticket, "KITCHEN_SENT", "Items sent to kitchen: " + pendingItems.size(), ticket.getServer());
        } else {
            log.debug("No pending items found for order {} when sending to kitchen", orderId);
        }

        return findById(orderId);
    }

    @Override
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
        return findById(orderId);
    }

    @Override
    public OrderResponse findById(UUID id) {
        OrderTicket ticket = orderTicketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        return mapToResponse(ticket);
    }

    @Override
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
            loyaltyService.processOrderPoints(ticket);
        }

        // US-2.4: Transition table to DIRTY upon payment
        if (ticket.getTable() != null) {
            TableShape table = ticket.getTable();
            table.setStatus(mls.sho.dms.entity.floor.TableStatus.DIRTY);
            tableShapeRepository.save(table);
        }

        orderTicketRepository.save(ticket);
        return mapToResponse(ticket);
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
        recordAuditLog(ticket, "ORDER_SERVED", "Order items delivered to guest", ticket.getServer());
        
        ticket = orderTicketRepository.save(ticket);
        return mapToResponse(ticket);
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
    public OrderResponse updateStatus(UUID orderId, TicketStatus status) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        log.debug("Updating order {} status from {} to {}", orderId, ticket.getStatus(), status);
        ticket.setStatus(status);
        if (status == TicketStatus.PAID) {
            ticket.setPaidAt(java.time.Instant.now());
        }
        ticket = orderTicketRepository.save(ticket);
        return mapToResponse(ticket);
    }

    private void recalculateTicket(OrderTicket ticket) {
        List<OrderItem> items = orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(ticket, OrderItemStatus.VOIDED);
        
        BigDecimal subtotal = items.stream()
            .map(i -> (i.getUnitPrice().add(i.getModifierUpchargeTotal())).multiply(new BigDecimal(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        ticket.setSubtotal(subtotal);
        
        // VAT calculation: 5% of subtotal after discounts (or before? usually before or on net)
        // Let's assume VAT is calculated on (Subtotal - Discount)
        BigDecimal netAmount = subtotal.subtract(ticket.getDiscountAmount()).max(BigDecimal.ZERO);
        BigDecimal tax = netAmount.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
        
        ticket.setTaxAmount(tax);
        ticket.setTotalAmount(netAmount.add(tax).add(ticket.getTipAmount()));
        
        orderTicketRepository.save(ticket);
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
            ticket.getPaidAt()
        );
    }

    private void recordAuditLog(OrderTicket order, String eventType, String details, StaffMember performedBy) {
        OrderAuditLog log = new OrderAuditLog(order, eventType, details, performedBy);
        orderAuditLogRepository.save(log);
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
            modifierResponses
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
    public OrderResponse cancelOrder(UUID orderId, String performedBy, String managerPin) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        // TODO: Manager PIN validation for submitted orders
        ticket.setStatus(TicketStatus.VOIDED);
        
        // Update Table status back to AVAILABLE if this was the only active order
        if (ticket.getTable() != null) {
            TableShape table = ticket.getTable();
            List<OrderTicket> otherActive = orderTicketRepository.findByTableAndStatusIn(table, List.of(TicketStatus.OPEN, TicketStatus.SUBMITTED));
            if (otherActive.size() <= 1) { // Current ticket is about to be cancelled
                table.setStatus(mls.sho.dms.entity.floor.TableStatus.DIRTY); // Usually DIRTY if they were seated
                tableShapeRepository.save(table);
            }
        }
        
        orderTicketRepository.save(ticket);
        StaffMember staff = staffMemberRepository.findByFullName(performedBy).orElse(null);
        recordAuditLog(ticket, "ORDER_CANCELLED", "Order cancelled by " + performedBy, staff);
        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public OrderResponse voidOrderItem(UUID orderId, UUID itemId, String reason, String performedBy, String managerPin) {
        OrderTicket ticket = orderTicketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        
        // TODO: Manager PIN validation for PREPARING/SENT items
        item.setStatus(OrderItemStatus.VOIDED);
        orderItemRepository.save(item);
        
        recalculateTicket(ticket);
        StaffMember staff = staffMemberRepository.findByFullName(performedBy).orElse(null);
        recordAuditLog(ticket, "ITEM_VOIDED", "Item " + item.getMenuItem().getName() + " voided: " + reason, staff);
        return mapToResponse(ticket);
    }
}
