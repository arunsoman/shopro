package mls.sho.dms.service.kds;

import mls.sho.dms.application.dto.kds.*;
import mls.sho.dms.entity.floor.TableStatus;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.kds.*;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.kds.*;
import mls.sho.dms.repository.menu.MenuCategoryRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

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
    private final StaffMemberRepository staffRepo;
    private final TableShapeRepository tableShapeRepository;

    public KDSService(KDSStationRepository stationRepository,
                      KDSRoutingRuleRepository routingRuleRepository,
                      KDSTicketRepository ticketRepository,
                      KDSTicketItemRepository ticketItemRepository,
                      MenuCategoryRepository categoryRepository,
                      MenuItemRepository menuItemRepository,
                      SimpMessagingTemplate messagingTemplate,
                      mls.sho.dms.application.mapper.KDSMapper kdsMapper,
                      OrderTicketRepository orderTicketRepository,
                      StaffMemberRepository staffRepo,
                      TableShapeRepository tableShapeRepository) {
        this.stationRepository = stationRepository;
        this.routingRuleRepository = routingRuleRepository;
        this.ticketRepository = ticketRepository;
        this.ticketItemRepository = ticketItemRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.messagingTemplate = messagingTemplate;
        this.kdsMapper = kdsMapper;
        this.orderTicketRepository = orderTicketRepository;
        this.staffRepo = staffRepo;
        this.tableShapeRepository = tableShapeRepository;
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

                log.debug("[KDS] Adding item {} to KDS ticket {}", itemName, kdsTicket.getId());
                KDSTicketItem kdsItem = new KDSTicketItem();
                kdsItem.setKdsTicket(kdsTicket);
                kdsItem.setOrderItem(orderItem);
                kdsItem.setStatus(KDSItemStatus.PENDING);
                kdsItem = ticketItemRepository.save(kdsItem);
                
                ticketItemsMap.computeIfAbsent(kdsTicket.getId(), id -> new ArrayList<>()).add(kdsItem);
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
                KDSTicketItem kdsItem = new KDSTicketItem();
                kdsItem.setKdsTicket(expoTicket);
                kdsItem.setOrderItem(orderItem);
                kdsItem.setStatus(KDSItemStatus.PENDING);
                ticketItemRepository.save(kdsItem);
                ticketItemsMap.computeIfAbsent(expoTicket.getId(), id -> new ArrayList<>()).add(kdsItem);
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
    public KDSTicketItem bumpItem(UUID kdsTicketItemId) {
        KDSTicketItem item = ticketItemRepository.findById(kdsTicketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        if (item.getStatus() == KDSItemStatus.PENDING) {
            item.setStatus(KDSItemStatus.COOKING);
        } else if (item.getStatus() == KDSItemStatus.COOKING) {
            item.setStatus(KDSItemStatus.READY);
            item.setReadyAt(Instant.now());
            
            // Notify POS that a specific item is ready
            UUID orderId = item.getKdsTicket().getOrderTicket().getId();
            String posTopic = "/topic/pos/notifications";
            String message = String.format("Item %s for %s is ready at %s", 
                item.getOrderItem().getMenuItem().getName(),
                item.getKdsTicket().getOrderTicket().getTable() != null ? item.getKdsTicket().getOrderTicket().getTable().getName() : "Ticket",
                item.getKdsTicket().getStation().getName());
            
            log.debug("Item bumped to READY. Notifying POS on topic {}: {}", posTopic, message);
            messagingTemplate.convertAndSend(posTopic, message);
            
            // Broadcast to KDS station that item was bumped
            KDSTicket ticket = item.getKdsTicket();
            String kdsTopic = "/topic/kds/station/" + ticket.getStation().getId();
            log.debug("Broadcasting item update back to KDS station on topic: {}", kdsTopic);
            
            List<KDSTicketItemResponse> itemDtos = ticketItemRepository.findByKdsTicket_Id(ticket.getId())
                    .stream().map(kdsMapper::toItemResponse).toList();
            KDSTicketResponse response = kdsMapper.toResponse(ticket, itemDtos);
            
            messagingTemplate.convertAndSend(kdsTopic, response);
        }
        
        return ticketItemRepository.save(item);
    }

    @Transactional
    public KDSTicket bumpTicket(UUID kdsTicketId) {
        KDSTicket ticket = ticketRepository.findById(kdsTicketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        ticket.setStatus(KDSTicketStatus.READY);
        ticket.setBumpedAt(Instant.now());
        
        // Mark all contained items as ready
        List<KDSTicketItem> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId());
        for (KDSTicketItem item : items) {
            item.setStatus(KDSItemStatus.READY);
            if (item.getReadyAt() == null) {
                item.setReadyAt(Instant.now());
            }
            ticketItemRepository.save(item);
        }
        
        ticket = ticketRepository.save(ticket);
        
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
        }

        // Notify POS that the entire KDS ticket is ready
        UUID orderId = ticket.getOrderTicket().getId();
        String posTopic = "/topic/pos/ticket/" + orderId;
        String message = "KDS Ticket Ready at " + ticket.getStation().getName();
        
        log.debug("Ticket {} bumped to READY. Notifying POS on topic {}: {}", ticket.getId(), posTopic, message);
        messagingTemplate.convertAndSend(posTopic, message);
        
        // Broadcast ticket update back to the KDS station queue
        String kdsTopic = "/topic/kds/station/" + ticket.getStation().getId();
        log.debug("Broadcasting ticket update back to KDS station on topic: {}", kdsTopic);
        
        List<KDSTicketItemResponse> itemDtos = items.stream().map(kdsMapper::toItemResponse).toList();
        KDSTicketResponse response = kdsMapper.toResponse(ticket, itemDtos);
        
        messagingTemplate.convertAndSend(kdsTopic, response);
        
        return ticket;
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
}
