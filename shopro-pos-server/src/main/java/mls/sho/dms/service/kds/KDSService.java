package mls.sho.dms.service.kds;

import mls.sho.dms.application.dto.kds.*;
import mls.sho.dms.application.dto.floor.TableShapeResponse;
import mls.sho.dms.entity.floor.TableStatus;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.kds.*;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderItemStatus;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.repository.order.OrderItemRepository;
import mls.sho.dms.repository.kds.*;
import mls.sho.dms.repository.menu.MenuCategoryRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;
import mls.sho.dms.application.service.order.OrderService;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

@Service
@lombok.extern.slf4j.Slf4j
public class KDSService {

    private final KDSStationRepository stationRepository;
    private final KDSRoutingRuleRepository routingRuleRepository;
    private final KDSTicketRepository ticketRepository;
    private final KDSTicketItemRepository ticketItemRepository;
    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final mls.sho.dms.application.mapper.KDSMapper kdsMapper;
    private final OrderTicketRepository orderTicketRepository;
    private final OrderItemRepository orderItemRepository;
    private final StaffRepository staffRepo;
    private final TableShapeRepository tableShapeRepository;
    private final OrderService orderService;

    public KDSService(KDSStationRepository stationRepository,
                      KDSRoutingRuleRepository routingRuleRepository,
                      KDSTicketRepository ticketRepository,
                      KDSTicketItemRepository ticketItemRepository,
                      MenuCategoryRepository categoryRepository,
                      MenuItemRepository menuItemRepository,
                      SimpMessagingTemplate messagingTemplate,
                      mls.sho.dms.application.mapper.KDSMapper kdsMapper,
                      OrderTicketRepository orderTicketRepository,
                      OrderItemRepository orderItemRepository,
                      StaffRepository staffRepo,
                      TableShapeRepository tableShapeRepository,
                      @Lazy OrderService orderService) {
        this.stationRepository = stationRepository;
        this.routingRuleRepository = routingRuleRepository;
        this.ticketRepository = ticketRepository;
        this.ticketItemRepository = ticketItemRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.messagingTemplate = messagingTemplate;
        this.kdsMapper = kdsMapper;
        this.orderTicketRepository = orderTicketRepository;
        this.orderItemRepository = orderItemRepository;
        this.staffRepo = staffRepo;
        this.tableShapeRepository = tableShapeRepository;
        this.orderService = orderService;
    }

    @Transactional
    public void routeOrder(OrderTicket orderTicket, List<OrderItem> itemsToRoute) {
        // Map of Station ID to KDS Ticket
        Map<UUID, KDSTicket> stationTickets = new HashMap<>();
        // Map to keep track of items per ticket for DTO mapping
        Map<UUID, List<KDSTicketItem>> ticketItemsMap = new HashMap<>();

        log.debug("[KDS] Routing order {} with {} items", orderTicket.getId(), itemsToRoute.size());
        for (OrderItem orderItem : itemsToRoute) {
            UUID menuItemId = orderItem.getMenuItem().getId();
            UUID categoryId = orderItem.getMenuItem().getCategory() != null ? orderItem.getMenuItem().getCategory().getId() : null;
            String itemName = orderItem.getMenuItem().getName();

            log.debug("[KDS] Processing item: {} (ID: {}, Category ID: {})", itemName, menuItemId, categoryId);

            // Find matching rules. Specific item rules take precedence over category rules.
            List<KDSRoutingRule> matchingRules = new ArrayList<>();
            matchingRules.addAll(routingRuleRepository.findByTargetTypeAndTargetId(RoutingTargetType.ITEM, menuItemId));
            
            if (matchingRules.isEmpty() && categoryId != null) {
                matchingRules.addAll(routingRuleRepository.findByTargetTypeAndTargetId(RoutingTargetType.CATEGORY, categoryId));
            }

            log.debug("[KDS] Found {} matching routing rules for item {}", matchingRules.size(), itemName);

            // Route to all matching stations
            for (KDSRoutingRule rule : matchingRules) {
                KDSStation station = rule.getStation();
                log.debug("[KDS] Matched station: {} (ID: {}, Online: {})", station.getName(), station.getId(), station.isOnline());

                KDSTicket kdsTicket = stationTickets.computeIfAbsent(station.getId(), id -> {
                    log.debug("[KDS] Creating new KDS ticket for station: {}", station.getName());
                    KDSTicket t = new KDSTicket();
                    t.setOrderTicket(orderTicket);
                    t.setStation(station);
                    t.setFiredAt(Instant.now());
                    t.setStatus(KDSTicketStatus.NEW);
                    return ticketRepository.save(t);
                });

                // US-5.1: Split into unit-level items for granular tracking (Adversarial Review fix)
                int quantity = orderItem.getQuantity();
                log.debug("[KDS] Splitting item {} into {} unit-level records for ticket {}", itemName, quantity, kdsTicket.getId());
                
                for (int k = 0; k < quantity; k++) {
                    KDSTicketItem kdsItem = new KDSTicketItem();
                    kdsItem.setKdsTicket(kdsTicket);
                    kdsItem.setOrderItem(orderItem);
                    kdsItem.setStatus(KDSItemStatus.PENDING);
                    kdsItem = ticketItemRepository.save(kdsItem);
                    ticketItemsMap.computeIfAbsent(kdsTicket.getId(), id -> new ArrayList<>()).add(kdsItem);
                }
            }
        }
        
        log.debug("[KDS] Completed item loop. Total stations to broadcast: {}", stationTickets.size());

        // --- Aggregator (EXPO) Support ---
        // Automatically route all items to any active EXPO stations
        List<KDSStation> expoStations = stationRepository.findByStationTypeAndOnlineTrue(KDSStationType.EXPO);
        for (KDSStation expo : expoStations) {
            log.debug("[KDS] Routing total order to EXPO station: {}", expo.getName());
            KDSTicket expoTicket = stationTickets.computeIfAbsent(expo.getId(), id -> {
                KDSTicket t = new KDSTicket();
                t.setOrderTicket(orderTicket);
                t.setStation(expo);
                t.setFiredAt(Instant.now());
                t.setStatus(KDSTicketStatus.NEW);
                return ticketRepository.save(t);
            });

            for (OrderItem orderItem : itemsToRoute) {
                int quantity = orderItem.getQuantity();
                for (int k = 0; k < quantity; k++) {
                    KDSTicketItem kdsItem = new KDSTicketItem();
                    kdsItem.setKdsTicket(expoTicket);
                    kdsItem.setOrderItem(orderItem);
                    kdsItem.setStatus(KDSItemStatus.PENDING);
                    ticketItemRepository.save(kdsItem);
                    ticketItemsMap.computeIfAbsent(expoTicket.getId(), id -> new ArrayList<>()).add(kdsItem);
                }
            }
        }
        
        // Broadcast new tickets to each affected KDS station
        stationTickets.forEach((stationId, ticket) -> {
            KDSStation station = ticket.getStation();
            if (station.isOnline()) {
                String topic = "/topic/kds/station/" + stationId;
                
                // Map to DTO to avoid Hibernate proxy serialization issues
                List<KDSTicketItemResponse> itemDtos = ticketItemsMap.getOrDefault(ticket.getId(), List.of())
                        .stream().map(kdsMapper::toItemResponse).toList();
                KDSTicketResponse response = kdsMapper.toResponse(ticket, itemDtos);

                log.debug("[KDS] Broadcasting ticket {} to ONLINE station {} via topic: {}", ticket.getId(), station.getName(), topic);
                messagingTemplate.convertAndSend(topic, response);
            }
        });
    }

    @Transactional
    public KDSTicketItem toggleItemStatus(UUID kdsTicketItemId) {
        KDSTicketItem item = ticketItemRepository.findById(kdsTicketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        KDSItemStatus currentStatus = item.getStatus();
        KDSItemStatus newStatus;

        if (currentStatus == KDSItemStatus.PENDING || currentStatus == KDSItemStatus.PAUSED) {
            newStatus = KDSItemStatus.COOKING;
        } else if (currentStatus == KDSItemStatus.COOKING) {
            newStatus = KDSItemStatus.PAUSED;
        } else {
            return item; // Ready or Served items can't be toggled back to cooking/pause via this method
        }

        syncItemStatus(item.getOrderItem().getId(), newStatus, item.getPriority());
        return ticketItemRepository.findById(kdsTicketItemId).orElse(item);
    }

    @Transactional
    public KDSTicketItem markItemReady(UUID kdsTicketItemId) {
        KDSTicketItem item = ticketItemRepository.findById(kdsTicketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        syncItemStatus(item.getOrderItem().getId(), KDSItemStatus.READY, item.getPriority());
        return ticketItemRepository.findById(kdsTicketItemId).orElse(item);
    }

    @Transactional
    public KDSTicketItem serveItem(UUID kdsTicketItemId) {
        KDSTicketItem item = ticketItemRepository.findById(kdsTicketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        if (item.getStatus() != KDSItemStatus.READY) {
            throw new IllegalStateException("Only READY items can be served");
        }

        syncItemStatus(item.getOrderItem().getId(), KDSItemStatus.SERVED, item.getPriority());
        
        // Notify the server
        notifyServer(item);
        
        return ticketItemRepository.findById(kdsTicketItemId).orElse(item);
    }

    @Transactional
    public void serveReadyItemsInTickets(List<UUID> ticketIds) {
        if (ticketIds == null) return;
        log.info("[KDS] Bulk serving ready items in tickets: {}", ticketIds);
        for (UUID ticketId : ticketIds) {
            List<KDSTicketItem> items = ticketItemRepository.findByKdsTicket_Id(ticketId);
            for (KDSTicketItem item : items) {
                if (item.getStatus() == KDSItemStatus.READY) {
                    String itemName = "Unknown Item";
                    if (item.getOrderItem() != null && item.getOrderItem().getMenuItem() != null) {
                        itemName = item.getOrderItem().getMenuItem().getName();
                    }
                    log.debug("[KDS] Serving ready item: {} from ticket: {}", itemName, ticketId);
                    syncItemStatus(item.getOrderItem().getId(), KDSItemStatus.SERVED, item.getPriority());
                    notifyServer(item);
                }
            }
        }
    }

    private void notifyServer(KDSTicketItem item) {
        OrderTicket order = item.getKdsTicket().getOrderTicket();
        String serverName = order.getServer() != null ? order.getServer().getFullName() : "Server";
        String tableName = order.getTable() != null ? order.getTable().getName() : "N/A";
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "ITEM_SERVED");
        notification.put("itemName", item.getOrderItem().getMenuItem().getName());
        notification.put("tableName", tableName);
        notification.put("message", String.format("🛎️ %s for Table %s is READY TO SERVE!", 
            item.getOrderItem().getMenuItem().getName(), tableName));
        
        // Broadcast to general notification topic and server-specific topic if possible
        messagingTemplate.convertAndSend("/topic/pos/notifications", notification);
        if (order.getServer() != null) {
            messagingTemplate.convertAndSend("/topic/staff/" + order.getServer().getId() + "/notifications", notification);
        }
    }

    @Transactional
    public KDSTicketItem bumpItem(UUID kdsTicketItemId) {
        KDSTicketItem item = ticketItemRepository.findById(kdsTicketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        KDSItemStatus status = item.getStatus();
        if (status == KDSItemStatus.PENDING || status == KDSItemStatus.COOKING || status == KDSItemStatus.PAUSED) {
            return markItemReady(kdsTicketItemId);
        } else if (status == KDSItemStatus.READY) {
            return serveItem(kdsTicketItemId);
        }
        return item;
    }

    private void syncItemStatus(UUID orderItemId, KDSItemStatus newStatus, int priority) {
        List<KDSTicketItem> sameItems = ticketItemRepository.findByOrderItem_Id(orderItemId);
        Instant now = Instant.now();
        
        for (KDSTicketItem peerItem : sameItems) {
            peerItem.setStatus(newStatus);
            peerItem.setPriority(priority);
            if (newStatus == KDSItemStatus.READY) {
                peerItem.setReadyAt(now);
            }
            
            KDSTicket ticket = peerItem.getKdsTicket();
            if (newStatus == KDSItemStatus.COOKING && ticket.getStatus() == KDSTicketStatus.NEW) {
                ticket.setStatus(KDSTicketStatus.COOKING);
                ticket.setCookingAt(now);
                ticketRepository.save(ticket);
                broadcastTicketStatusUpdate(ticket);
            }
            
            ticketItemRepository.saveAndFlush(peerItem);
            broadcastTicketToStation(ticket);
        }
        
        // --- POS Synchronization ---
        orderItemRepository.findById(orderItemId).ifPresent(orderItem -> {
            boolean changed = false;
            if (newStatus == KDSItemStatus.READY && orderItem.getStatus() != OrderItemStatus.READY) {
                orderItem.setStatus(OrderItemStatus.READY);
                changed = true;
            } else if (newStatus == KDSItemStatus.SERVED && orderItem.getStatus() != OrderItemStatus.DELIVERED) {
                orderItem.setStatus(OrderItemStatus.DELIVERED);
                changed = true;
            }

            if (changed) {
                orderItemRepository.save(orderItem);
                
                // Broadcast update to POS Order management screens
                Map<String, Object> payload = new HashMap<>();
                payload.put("type", "STATUS_UPDATE");
                payload.put("orderId", orderItem.getTicket().getId());
                payload.put("itemId", orderItemId);
                payload.put("status", orderItem.getStatus().name());
                
                messagingTemplate.convertAndSend("/topic/orders/" + orderItem.getTicket().getId(), payload);
                
                // Re-evaluate parent ticket status (US-3.7/4.1 Fix)
                orderService.updateTicketStatusFromItems(orderItem.getTicket().getId());
            }
        });

        if (newStatus == KDSItemStatus.READY) {
            messagingTemplate.convertAndSend("/topic/pos/notifications", "Item ready");
        }
    }

    private void broadcastTicketStatusUpdate(KDSTicket ticket) {
        Map<String, Object> update = new HashMap<>();
        update.put("ticketId", ticket.getId());
        update.put("stationName", ticket.getStation().getName());
        update.put("status", ticket.getStatus().name());
        update.put("orderId", ticket.getOrderTicket().getId());
        messagingTemplate.convertAndSend("/topic/kds/status", update);
    }

    @Transactional
    public KDSTicket startCookingTicket(UUID kdsTicketId) {
        KDSTicket ticket = ticketRepository.findById(kdsTicketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        if (ticket.getStatus() == KDSTicketStatus.NEW) {
            ticket.setStatus(KDSTicketStatus.COOKING);
            ticket.setCookingAt(Instant.now());
            ticket = ticketRepository.save(ticket);
            
            // Sync all items on this ticket to COOKING status across all stations
            List<KDSTicketItem> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId());
            for (KDSTicketItem item : items) {
                syncItemStatus(item.getOrderItem().getId(), KDSItemStatus.COOKING, item.getPriority());
            }

            broadcastTicketStatusUpdate(ticket);
            broadcastTicketToStation(ticket);
        }
        
        return ticket;
    }

    private void broadcastTicketToStation(KDSTicket ticket) {
        String kdsTopic = "/topic/kds/station/" + ticket.getStation().getId();
        List<KDSTicketItemResponse> itemDtos = ticketItemRepository.findByKdsTicket_Id(ticket.getId())
                .stream().map(kdsMapper::toItemResponse).toList();
        KDSTicketResponse response = kdsMapper.toResponse(ticket, itemDtos);
        messagingTemplate.convertAndSend(kdsTopic, response);
    }

    @Transactional
    public KDSTicket bumpTicket(UUID kdsTicketId) {
        KDSTicket ticket = ticketRepository.findById(kdsTicketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        ticket.setStatus(KDSTicketStatus.READY);
        ticket.setBumpedAt(Instant.now());
        ticket = ticketRepository.saveAndFlush(ticket);
        
        // Sync all items on this ticket to READY status across all stations
        List<KDSTicketItem> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId());
        for (KDSTicketItem item : items) {
            syncItemStatus(item.getOrderItem().getId(), KDSItemStatus.READY, item.getPriority());
        }
        
        // US-4.1: Transition table to FOOD_DELIVERED if bumped at EXPO
        if (ticket.getStation().getStationType() == KDSStationType.EXPO) {
            OrderTicket orderTicket = ticket.getOrderTicket();
            if (orderTicket.getTable() != null) {
                TableShape table = orderTicket.getTable();
                // Only transition if currently ORDERED or ORDER_PLACED
                if (table.getStatus() == TableStatus.ORDER_PLACED || table.getStatus() == TableStatus.ORDERED) {
                    table.setStatus(TableStatus.FOOD_DELIVERED);
                    tableShapeRepository.save(table);
                    log.debug("Table {} transitioned to FOOD_DELIVERED via EXPO bump", table.getName());
                }
            }

            // EXPO special notification: Order Stats
            Map<String, Object> stats = new HashMap<>();
            stats.put("orderId", orderTicket.getId());
            stats.put("prepDurationSeconds", java.time.Duration.between(ticket.getFiredAt(), Instant.now()).getSeconds());
            stats.put("itemCount", items.size());
            stats.put("tableName", orderTicket.getTable() != null ? orderTicket.getTable().getName() : "N/A");
            
            messagingTemplate.convertAndSend("/topic/pos/stats", stats);
            
            String expoMessage = String.format("🎉 Order for Table %s is READY for service!", 
                orderTicket.getTable() != null ? orderTicket.getTable().getName() : "Ticket");
            messagingTemplate.convertAndSend("/topic/pos/notifications", expoMessage);
        }

        // Broadcast BUMPED status to KDS status topic
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("ticketId", ticket.getId());
        statusUpdate.put("stationName", ticket.getStation().getName());
        statusUpdate.put("status", "BUMPED");
        statusUpdate.put("orderId", ticket.getOrderTicket().getId());
        messagingTemplate.convertAndSend("/topic/kds/status", statusUpdate);

        // Notify POS that the entire KDS ticket is ready
        UUID orderId = ticket.getOrderTicket().getId();
        String posTopic = "/topic/pos/ticket/" + orderId;
        String message = "KDS Ticket Ready at " + ticket.getStation().getName();
        
        log.debug("Ticket {} bumped to READY. Notifying POS on topic {}: {}", ticket.getId(), posTopic, message);
        messagingTemplate.convertAndSend(posTopic, message);
        
        // Broadcast order update to POS for this specific order
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, "REFRESH");
        if (ticket.getOrderTicket().getTable() != null) {
            broadcastTableUpdate(ticket.getOrderTicket().getTable());
        }
        
        // Broadcast ticket update back to the KDS station queue
        broadcastTicketToStation(ticket);
        
        return ticket;
    }

    @Transactional
    public KDSTicketItem updateItemPriority(UUID itemId, int priority) {
        KDSTicketItem item = ticketItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        // Sync priority across all stations for this order item
        syncItemStatus(item.getOrderItem().getId(), item.getStatus(), priority);
        
        return ticketItemRepository.findById(itemId).orElse(item);
    }

    @Transactional(readOnly = true)
    public List<KDSTicketResponse> getActiveTicketsForStation(UUID stationId) {
        List<KDSTicket> tickets = ticketRepository.findActiveByStation(
                stationId, 
                Arrays.asList(KDSTicketStatus.NEW, KDSTicketStatus.COOKING),
                Arrays.asList(mls.sho.dms.entity.order.TicketStatus.PAID, mls.sho.dms.entity.order.TicketStatus.VOIDED)
        );
        
        return tickets.stream().map(ticket -> {
            List<KDSTicketItemResponse> itemDtos = ticketItemRepository.findByKdsTicket_Id(ticket.getId())
                    .stream().map(kdsMapper::toItemResponse).toList();
            return kdsMapper.toResponse(ticket, itemDtos);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean areAllTicketsNew(UUID orderId) {
        List<KDSTicket> tickets = ticketRepository.findByOrderTicket_Id(orderId);
        if (tickets.isEmpty()) return true; // Not yet sent to KDS
        return tickets.stream().allMatch(t -> t.getStatus() == KDSTicketStatus.NEW);
    }

    @Transactional(readOnly = true)
    public boolean isItemPendingInKDS(UUID orderItemId) {
        List<KDSTicketItem> items = ticketItemRepository.findByOrderItem_Id(orderItemId);
        if (items.isEmpty()) return true; // Not yet sent or already voided
        return items.stream().allMatch(i -> i.getStatus() == KDSItemStatus.PENDING);
    }

    /**
     * Returns the count of unit-level KDS items still in PENDING status.
     * Used for partial decrement logic (Adversarial Review US-5.1).
     */
    @Transactional(readOnly = true)
    public int getRemovableQuantity(UUID orderItemId) {
        List<KDSTicketItem> items = ticketItemRepository.findByOrderItem_Id(orderItemId);
        if (items.isEmpty()) return 0; // If not in KDS, it might be unsubmitted (handled in OrderService)
        
        // We only care about PREP stations for 'removable' logic, but usually it's global across all stations for that item unit.
        // However, to be safe, we check if ANY unit at ANY station is not pending.
        // Actually, if I have 3 units, and 1 is cooking at Station A, then only 2 are 'removable'.
        
        // Group by 'unit'? Since we don't have a unit ID, we rely on the fact that routeOrder
        // creates N items per station. 
        // A unit is 'removable' only if it is PENDING at ALL stations it is routed to.
        
        // Simplified for MVP: Since items are usually routed to 1 prep station + 1 expo station,
        // we check the Prep station status.
        return (int) items.stream()
                .filter(i -> i.getKdsTicket().getStation().getStationType() != KDSStationType.EXPO)
                .filter(i -> i.getStatus() == KDSItemStatus.PENDING)
                .count();
    }

    /**
     * Deletes the specified number of PENDING unit-level KDS items.
     */
    @Transactional
    public void decrementUnits(UUID orderItemId, int unitsToRemove) {
        log.info("[KDS] Decrementing {} units for order item: {}", unitsToRemove, orderItemId);
        
        // Find all pending items across all stations for this order item
        List<KDSTicketItem> allItems = ticketItemRepository.findByOrderItem_Id(orderItemId);
        
        // We need to remove the same 'units' across all stations they were routed to.
        // If we had unit IDs it would be easier. For now, we delete N pending records from each station.
        Set<UUID> stationIds = allItems.stream().map(i -> i.getKdsTicket().getStation().getId()).collect(Collectors.toSet());
        
        for (UUID stationId : stationIds) {
            List<KDSTicketItem> stationPending = allItems.stream()
                    .filter(i -> i.getKdsTicket().getStation().getId().equals(stationId))
                    .filter(i -> i.getStatus() == KDSItemStatus.PENDING)
                    .limit(unitsToRemove)
                    .toList();
            
            log.debug("[KDS] Deleting {} pending units from station {}", stationPending.size(), stationId);
            ticketItemRepository.deleteAll(stationPending);
        }
    }

    @Transactional
    public void voidItemInKDS(UUID orderItemId) {
        List<KDSTicketItem> items = ticketItemRepository.findByOrderItem_Id(orderItemId);
        Set<KDSTicket> affectedTickets = new HashSet<>();
        for (KDSTicketItem item : items) {
            affectedTickets.add(item.getKdsTicket());
            ticketItemRepository.delete(item);
        }
        
        for (KDSTicket ticket : affectedTickets) {
            List<KDSTicketItem> remaining = ticketItemRepository.findByKdsTicket_Id(ticket.getId());
            if (remaining.isEmpty()) {
                ticketRepository.delete(ticket);
                broadcastTicketCancellation(ticket);
            } else {
                broadcastTicketToStation(ticket);
            }
        }
    }

    @Transactional
    public void cancelKDSTickets(UUID orderId) {
        List<KDSTicket> tickets = ticketRepository.findByOrderTicket_Id(orderId);
        for (KDSTicket ticket : tickets) {
            ticketItemRepository.deleteByKdsTicket_Id(ticket.getId());
            ticketRepository.delete(ticket);
            broadcastTicketCancellation(ticket);
        }
    }

    private void broadcastTicketCancellation(KDSTicket ticket) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "TICKET_CANCELLED");
        payload.put("ticketId", ticket.getId());
        payload.put("orderId", ticket.getOrderTicket().getId());
        messagingTemplate.convertAndSend("/topic/kds/station/" + ticket.getStation().getId(), payload);
        messagingTemplate.convertAndSend("/topic/kds/status", payload);
    }

    // --- KDS Station CRUD ---

    public KDSStationResponse getStationById(UUID id) {
        KDSStation s = stationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));
        return new KDSStationResponse(s.getId(), s.getName(), s.getStationType(), s.isOnline());
    }

    public List<KDSStationResponse> getAllStations() {
        return stationRepository.findAll().stream()
                .map(s -> new KDSStationResponse(s.getId(), s.getName(), s.getStationType(), s.isOnline()))
                .collect(Collectors.toList());
    }

    @Transactional
    public KDSStationResponse createStation(KDSStationRequest request) {
        KDSStation station = new KDSStation();
        station.setName(request.name());
        station.setStationType(request.stationType());
        station.setOnline(true);
        station = stationRepository.save(station);
        return new KDSStationResponse(station.getId(), station.getName(), station.getStationType(), station.isOnline());
    }

    @Transactional
    public KDSStationResponse toggleStationStatus(UUID id) {
        KDSStation station = stationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));
        station.setOnline(!station.isOnline());
        station = stationRepository.save(station);
        return new KDSStationResponse(station.getId(), station.getName(), station.getStationType(), station.isOnline());
    }

    @Transactional
    public KDSStationResponse updateStation(UUID id, KDSStationRequest request) {
        KDSStation station = stationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));
        station.setName(request.name());
        station.setStationType(request.stationType());
        station = stationRepository.save(station);
        return new KDSStationResponse(station.getId(), station.getName(), station.getStationType(), station.isOnline());
    }

    @Transactional
    public void deleteStation(UUID id) {
        routingRuleRepository.deleteByStation_Id(id);
        stationRepository.deleteById(id);
    }

    // --- KDS Routing Rule CRUD ---

    public List<KDSRoutingRuleResponse> getAllRoutingRules() {
        return routingRuleRepository.findAll().stream()
                .map(this::mapToRoutingRuleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public KDSRoutingRuleResponse createRoutingRule(KDSRoutingRuleRequest request) {
        KDSStation station = stationRepository.findById(request.stationId())
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));

        KDSRoutingRule rule = new KDSRoutingRule();
        rule.setStation(station);
        rule.setTargetType(request.targetType());
        rule.setTargetId(request.targetId());
        rule = routingRuleRepository.save(rule);
        return mapToRoutingRuleResponse(rule);
    }

    @Transactional
    public void deleteRoutingRule(UUID id) {
        routingRuleRepository.deleteById(id);
    }

    private KDSRoutingRuleResponse mapToRoutingRuleResponse(KDSRoutingRule rule) {
        String targetName = "Unknown";
        if (rule.getTargetType() == RoutingTargetType.CATEGORY) {
            targetName = categoryRepository.findById(rule.getTargetId())
                    .map(c -> c.getName()).orElse("Deleted Category");
        } else if (rule.getTargetType() == RoutingTargetType.ITEM) {
            targetName = menuItemRepository.findById(rule.getTargetId())
                    .map(i -> i.getName()).orElse("Deleted Item");
        }

        return new KDSRoutingRuleResponse(
                rule.getId(),
                rule.getStation().getId(),
                rule.getStation().getName(),
                rule.getTargetType(),
                rule.getTargetId(),
                targetName
        );
    }

    private void broadcastTableUpdate(TableShape table) {
        if (table == null) return;
        
        TableShapeResponse response = new TableShapeResponse(
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
        
        messagingTemplate.convertAndSend("/topic/tables", response);
    }
}
