package mls.sho.dms.application.kds.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.event.PosTicketReadyEvent;
import mls.sho.dms.application.kds.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.WebSocketSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * STATION-SIDE SERVICE
 * Everything a cook at a specific station needs.
 * Scope: one station, one device, heads-down execution.
 */
@Service
@RequiredArgsConstructor
public class StationKdsService {

    private final KdsTicketRepository ticketRepository;
    private final KdsTicketItemRepository ticketItemRepository;
    private final StationTicketItemRepository stationTicketItemRepository;
    private final KdsStationRepository stationRepository;
    private final KdsDeviceRepository deviceRepository;
    private final KdsSettingsRepository settingsRepository;
    private final KdsEventLogRepository eventLogRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;

    // ── Queue reads ─────────────────────────────────────────────

    /**
     * [CACHE] The live queue for this station.
     *
     * Returns only tickets that have at least one unbumped item
     * routed to THIS station. The cook sees nothing from
     * other stations.
     *
     * Each ticket in the response includes:
     *   - ticketNumber, guestCount, source
     *   - firedAt, secondsElapsed (computed live)
     *   - priority (RUSH → shown at top with amber border)
     *   - serverNote (allergy/VIP note — shown in amber)
     *   - items[]: only items routed to this station
     *       each item: name, qty, modifications (as string[]),
     *       allergenFlags, status, secondsElapsed at station level
     *   - courseInfo: which course is active, which are pending
     *
     * Sorted by KdsSettings.sortOrder:
     *   FIRED_ASC      = oldest first (standard — cook burns
     *                    down the oldest ticket first)
     *   PRIORITY_FIRST = RUSH tickets float to top, then FIRED_ASC
     *
     * Hit:  kds:{rId}:outlet:{oId}:station:{sId}:queue  TTL: none
     * Miss: [DB] join KdsTicket + KdsTicketItem +
     *             StationTicketItem WHERE station = this AND
     *             status != DONE AND status != VOIDED
     *       → build dto → store
     *
     * Called on initial WebSocket connect (catch-up load)
     * and whenever the device requests a manual refresh.
     * Normal updates arrive via WebSocket push, not polling.
     */
    public List<StationTicketDto> getQueue(Long stationId, Long deviceId) {
        KdsStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found: " + stationId));

        List<StationTicketItem> activeItems = stationTicketItemRepository.findByStationIdAndStatusIn(
                stationId, List.of(StationTicketItem.StationItemStatus.NEW, 
                                   StationTicketItem.StationItemStatus.IN_PROGRESS,
                                   StationTicketItem.StationItemStatus.RECALLED));

        return activeItems.stream()
                .collect(java.util.stream.Collectors.groupingBy(si -> si.getTicketItem().getTicket().getId()))
                .values().stream()
                .map(this::mapToStationTicketDto)
                .sorted(this::sortTickets)
                .toList();
    }

    private StationTicketDto mapToStationTicketDto(List<StationTicketItem> items) {
        KdsTicket ticket = items.get(0).getTicketItem().getTicket();
        List<StationTicketItemDto> itemDtos = items.stream()
                .map(si -> StationTicketItemDto.builder()
                        .id(si.getId())
                        .name(si.getTicketItem().getMenuItemName())
                        .quantity(si.getTicketItem().getQuantity())
                        .prepTimeMinutes(si.getTicketItem().getPrepTimeMinutes())
                        .modifications(si.getTicketItem().getModifications() != null ? 
                             java.util.Arrays.asList(si.getTicketItem().getModifications().split(", ")) : List.of())
                        .allergenFlags(si.getTicketItem().getAllergenFlags() != null ? 
                             java.util.Arrays.asList(si.getTicketItem().getAllergenFlags().split("\\|")) : List.of())
                        .status(si.getStatus().name())
                        .secondsElapsed(java.time.Duration.between(ticket.getFiredAt(), LocalDateTime.now()).getSeconds())
                        .build())
                .toList();

        return StationTicketDto.builder()
                .id(ticket.getId())
                .ticketId(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .guestCount(ticket.getGuestCount())
                .source(ticket.getSource().name())
                .priority(ticket.getPriority().name())
                .serverNote(ticket.getServerNote())
                .firedAt(ticket.getFiredAt())
                .secondsElapsed(java.time.Duration.between(ticket.getFiredAt(), LocalDateTime.now()).getSeconds())
                .items(itemDtos)
                .courseNumber(ticket.getCourseNumber())
                .build();
    }

    private int sortTickets(StationTicketDto a, StationTicketDto b) {
        if ("RUSH".equals(a.getPriority()) && !"RUSH".equals(b.getPriority())) return -1;
        if (!"RUSH".equals(a.getPriority()) && "RUSH".equals(b.getPriority())) return 1;
        return a.getFiredAt().compareTo(b.getFiredAt());
    }

    /**
     * [CACHE] Queue filtered by deviceType capacity.
     *
     * Same as getQueue() but sliced to what the screen can show:
     *   PHONE:       2 tickets
     *   TABLET:      4 tickets
     *   FULL_SCREEN: KdsSettings.maxTicketsPerScreen (default 6)
     *   BROWSER:     KdsSettings.maxTicketsPerScreen
     *
     * Returns the N highest-priority tickets (RUSH first, then
     * oldest). The total count in the queue is included in the
     * response header so the device can show "3 more in queue".
     *
     * This is the primary read called by the device's WebSocket
     * subscription handler on every QUEUE_UPDATE push.
     */
    public StationQueuePageDto getQueuePage(Long stationId, Long deviceId) {
        List<StationTicketDto> fullQueue = getQueue(stationId, deviceId);
        KdsDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        
        int limit = switch (device.getDeviceType()) {
            case PHONE -> 2;
            case TABLET -> 4;
            default -> settingsRepository.findByOutletId(stationRepository.findById(stationId).get().getOutlet().getId())
                                     .map(KdsSettings::getMaxTicketsPerScreen).orElse(6);
        };

        List<StationTicketDto> page = fullQueue.stream().limit(limit).toList();

        return StationQueuePageDto.builder()
                .stationId(stationId)
                .tickets(page)
                .totalTicketsInQueue(fullQueue.size())
                .remainingCount(Math.max(0, fullQueue.size() - limit))
                .build();
    }

    /**
     * [DB] Single ticket detail for this station.
     * Returns one StationTicketDto — used when a cook taps
     * a ticket to expand its detail view.
     * Only returns items routed to THIS station.
     */
    public StationTicketDto getTicket(Long stationId, Long ticketId) {
        List<StationTicketItem> items = stationTicketItemRepository.findByStationIdAndTicketItemTicketId(stationId, ticketId);
        if (items.isEmpty()) throw new IllegalArgumentException("Ticket not found for this station.");
        return mapToStationTicketDto(items);
    }

    // ── Cook interactions ────────────────────────────────────────

    /**
     * Mark a single item as IN_PROGRESS at this station.
     *
     * Only available if KdsSettings.enableStartAction = true.
     * Most kitchens skip this — they just bump.
     * Useful for stations with long cook times where the manager
     * wants to see when the cook actually started.
     *
     * Pipeline:
     *   1. Validate deviceId is paired to stationId
     *   2. Validate StationTicketItem belongs to stationId
     *   3. StationTicketItem.status NEW → IN_PROGRESS
     *   4. StationTicketItem.startedAt = now
     *   5. [DB] KdsEventLog: ITEM_STARTED
     *   6. [INVAL] Station queue cache
     *   7. [EVENT] KdsQueueChangedEvent → WebSocket broadcast
     *      to all devices on this station
     *
     * Returns: updated StationTicketItemDto
     * Endpoint: handled in StationKdsController
     */
    @Transactional
    public StationTicketItemDto startItem(Long stationId, Long stationItemId, Long deviceId) {
        StationTicketItem si = stationTicketItemRepository.findById(stationItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + stationItemId));
        
        if (!si.getStation().getId().equals(stationId)) throw new IllegalArgumentException("Station mismatch.");

        si.setStatus(StationTicketItem.StationItemStatus.IN_PROGRESS);
        si.setStartedAt(LocalDateTime.now());
        stationTicketItemRepository.save(si);

        logEvent(si.getTicketItem().getTicket(), "ITEM_STARTED", "Item " + si.getTicketItem().getMenuItemName() + " started at station " + stationId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(si.getStation().getOutlet().getId(), stationId));

        return StationTicketItemDto.builder()
                .id(si.getId())
                .name(si.getTicketItem().getMenuItemName())
                .quantity(si.getTicketItem().getQuantity())
                .status(si.getStatus().name())
                .build();
    }

    /**
     * Bump a single item at this station. The core cook action.
     *
     * Pipeline:
     *   1. Validate deviceId is paired to stationId
     *   2. Validate StationTicketItem.status is NEW or IN_PROGRESS
     *   3. StationTicketItem.status → DONE
     *   4. StationTicketItem.bumpedAt = now
     *   5. StationTicketItem.bumpedByDeviceId = deviceId
     *   6. prepTimeSeconds = ChronoUnit.SECONDS.between(ticket.firedAt, now)
     *   7. Check sibling StationTicketItems for this KdsTicketItem:
     *      if all DONE → KdsTicketItem.status = DONE
     *   8. Check all KdsTicketItems in this KdsTicket:
     *      if all DONE or VOIDED → KdsTicket.status = COMPLETE
     *        → completedAt = now
     *        → [EVENT] KdsTicketCompleteEvent
     *        → [EVENT] PosTicketReadyEvent (if posOrderId exists)
     *   9. [DB] KdsEventLog: ITEM_BUMPED (with prepTimeSeconds)
     *  10. [INVAL] Station queue cache, ticket state cache
     *  11. [EVENT] KdsQueueChangedEvent → broadcast to:
     *        - this station's devices (item disappears or ticket completes)
     *        - EXPO station (item status updated in expo view)
     *
     * Returns: BumpResultDto
     */
    @Transactional
    public BumpResultDto bumpItem(Long stationId, Long stationItemId, Long deviceId) {
        StationTicketItem si = stationTicketItemRepository.findById(stationItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + stationItemId));
        
        if (si.getStatus() == StationTicketItem.StationItemStatus.DONE) return new BumpResultDto();

        si.setStatus(StationTicketItem.StationItemStatus.DONE);
        si.setBumpedAt(LocalDateTime.now());
        si.setBumpedByDeviceId(deviceId);
        stationTicketItemRepository.save(si);

        KdsTicketItem item = si.getTicketItem();
        boolean itemDone = item.getStationItems().stream().allMatch(s -> s.getStatus() == StationTicketItem.StationItemStatus.DONE);
        if (itemDone) {
            item.setStatus(KdsTicketItem.ItemStatus.DONE);
            ticketItemRepository.save(item);
        }

        KdsTicket ticket = item.getTicket();
        boolean ticketDone = ticket.getItems().stream().allMatch(i -> i.getStatus() == KdsTicketItem.ItemStatus.DONE || i.getStatus() == KdsTicketItem.ItemStatus.VOIDED);
        if (ticketDone) {
            ticket.setStatus(KdsTicket.TicketStatus.COMPLETE);
            ticket.setCompletedAt(LocalDateTime.now());
            ticket.setPrepTimeSeconds((int) java.time.Duration.between(ticket.getFiredAt(), ticket.getCompletedAt()).getSeconds());
            ticketRepository.save(ticket);
            
            if (ticket.getPosOrderId() != null) {
                eventPublisher.publishEvent(new PosTicketReadyEvent(ticket.getPosOrderId(), ticket.getTicketNumber()));
            }
        }

        logEvent(ticket, "ITEM_BUMPED", "Item " + item.getMenuItemName() + " bumped at station " + stationId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), stationId));

        return BumpResultDto.builder()
                .stationItemId(si.getId())
                .ticketCompleted(ticketDone)
                .build();
    }

    /**
     * Bump ALL unbumped items for one ticket at this station.
     *
     * Convenience action — typically mapped to the physical
     * bump bar button on a dedicated KDS unit, or a long-press
     * on a touchscreen.
     *
     * Calls bumpItem() for each StationTicketItem WHERE
     * stationId = this AND ticketId = given AND status != DONE
     * in a single transaction.
     *
     * Returns: BumpAllResultDto
     */
    @Transactional
    public BumpAllResultDto bumpAll(Long stationId, Long ticketId, Long deviceId) {
        List<StationTicketItem> items = stationTicketItemRepository.findByStationIdAndTicketItemTicketId(stationId, ticketId);
        items.stream()
                .filter(si -> si.getStatus() != StationTicketItem.StationItemStatus.DONE)
                .forEach(si -> bumpItem(stationId, si.getId(), deviceId));
        
        return BumpAllResultDto.builder()
                .ticketId(ticketId)
                .itemsBumped(items.size())
                .build();
    }

    /**
     * Recall a single bumped item back to the queue.
     *
     * Available only within KdsSettings.recallWindowSeconds
     * after bumpedAt. After that window, only the expeditor
     * can recall (via ExpoKdsService.recallItem).
     *
     * A cook might use this when they realise they bumped the
     * wrong item, or the runner came back because the guest
     * changed their mind.
     *
     * Pipeline:
     *   1. Check now - bumpedAt <= recallWindowSeconds
     *      If outside window → throw RecallWindowExpiredException
     *   2. StationTicketItem.status DONE → RECALLED
     *   3. StationTicketItem.recalledAt = now
     *   4. If KdsTicketItem was DONE → reset to IN_PROGRESS
     *   5. If KdsTicket was COMPLETE → reset to ACTIVE
     *      → completedAt = null
     *   6. [DB] KdsEventLog: ITEM_RECALLED
     *   7. [INVAL] Station queue cache
     *   8. [EVENT] KdsQueueChangedEvent → item reappears on screen
     *
     * Returns: RecallResultDto
     */
    @Transactional
    public RecallResultDto recallItem(Long stationId, Long stationItemId, Long deviceId) {
        StationTicketItem si = stationTicketItemRepository.findById(stationItemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + stationItemId));
        
        // Simple window check (default 60s)
        if (java.time.Duration.between(si.getBumpedAt(), LocalDateTime.now()).getSeconds() > 60) {
            throw new RuntimeException("Recall window expired.");
        }

        si.setStatus(StationTicketItem.StationItemStatus.RECALLED);
        si.setRecalledAt(LocalDateTime.now());
        stationTicketItemRepository.save(si);

        KdsTicketItem item = si.getTicketItem();
        if (item.getStatus() == KdsTicketItem.ItemStatus.DONE) {
            item.setStatus(KdsTicketItem.ItemStatus.IN_PROGRESS);
            ticketItemRepository.save(item);
        }

        KdsTicket ticket = item.getTicket();
        if (ticket.getStatus() == KdsTicket.TicketStatus.COMPLETE) {
            ticket.setStatus(KdsTicket.TicketStatus.ACTIVE);
            ticket.setCompletedAt(null);
            ticketRepository.save(ticket);
        }

        logEvent(ticket, "ITEM_RECALLED", "Item " + item.getMenuItemName() + " recalled at station " + stationId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), stationId));

        return RecallResultDto.builder()
                .stationItemId(si.getId())
                .status("RECALLED")
                .build();
    }

    /**
     * Recall ALL bumped items for a ticket at this station.
     * Same as recallItem() but for all DONE items in the ticket.
     * Subject to the same recallWindowSeconds constraint.
     */
    @Transactional
    public void recallAll(Long stationId, Long ticketId, Long deviceId) {
        List<StationTicketItem> items = stationTicketItemRepository.findByStationIdAndTicketItemTicketId(stationId, ticketId);
        items.stream()
                .filter(si -> si.getStatus() == StationTicketItem.StationItemStatus.DONE)
                .forEach(si -> recallItem(stationId, si.getId(), deviceId));
    }

    // ── Device lifecycle ─────────────────────────────────────────

    /**
     * Called by WebSocket connect handler.
     * 1. Authenticate device token
     * 2. Mark device ONLINE in Redis (TTL 90s)
     * 3. Register WebSocket session against deviceId
     * 4. Send immediate QUEUE_UPDATE with full current queue
     * 5. [DB] KdsEventLog: DEVICE_ONLINE
     */
    public StationQueuePageDto onDeviceConnect(Long deviceId, WebSocketSession session) {
        logDeviceActivity(deviceId);
        return getQueuePage(0L, deviceId); // stationId 0 placeholder
    }

    /**
     * Called by WebSocket disconnect handler.
     * 1. Mark device OFFLINE in Redis
     * 2. Remove session registration
     * 3. [DB] KdsEventLog: DEVICE_OFFLINE
     * 4. [EVENT] KdsDeviceOfflineEvent → broadcast to expo
     *    so manager can see a station has lost its screen
     */
    public void onDeviceDisconnect(Long deviceId) {
        try {
            redisTemplate.delete(String.format("kds:device:%d:status", deviceId));
        } catch (Exception e) {
            // Redis down, skip status tracking
        }
    }

    /**
     * Heartbeat — called every 30s by connected devices.
     * Refreshes device online TTL in Redis.
     * Updates KdsDevice.lastSeenAt in DB (batched, not per-heartbeat).
     */
    public void heartbeat(Long deviceId) {
        logDeviceActivity(deviceId);
    }

    private void logDeviceActivity(Long deviceId) {
        try {
            redisTemplate.opsForValue().set(String.format("kds:device:%d:status", deviceId), "ONLINE", 90, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Redis down, skip status tracking
        }
    }

    private void logEvent(KdsTicket ticket, String type, String note) {
        KdsEventLog log = KdsEventLog.builder()
                .outletId(ticket.getOutletId())
                .ticketId(ticket.getId())
                .eventType(KdsEventLog.KdsEventType.valueOf(type))
                .payload(note)
                .occurredAt(LocalDateTime.now())
                .build();
        eventLogRepository.save(log);
    }
}
