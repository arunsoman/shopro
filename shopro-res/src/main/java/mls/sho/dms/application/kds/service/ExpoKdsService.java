package mls.sho.dms.application.kds.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.event.KdsSettingsChangedEvent;
import mls.sho.dms.application.kds.event.PosTicketReadyEvent;
import mls.sho.dms.application.kds.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * EXPEDITOR-SIDE SERVICE
 */
@Service
@RequiredArgsConstructor
public class ExpoKdsService {

    private final KdsTicketRepository ticketRepository;
    private final KdsTicketItemRepository ticketItemRepository;
    private final StationTicketItemRepository stationTicketItemRepository;
    private final KdsStationRepository stationRepository;
    private final KdsSettingsRepository settingsRepository;
    private final KdsDeviceRepository deviceRepository;
    private final OutletRepository outletRepository;
    private final StationRoutingRepository routingRepository;
    private final KdsEventLogRepository eventLogRepository;
    private final TicketDispatchService ticketDispatchService;
    private final KdsVoidService voidService;
    private final KdsSettingsService settingsService;
    private final ApplicationEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;

    // ── Full-pass view ───────────────────────────────────────────

    /**
     * [CACHE] The complete pass view for an outlet.
     *
     * Returns ALL active tickets across ALL stations.
     * Each ticket shows:
     *   - ticketNumber, guestCount, source, serverNote
     *   - firedAt, secondsElapsed (live)
     *   - priority
     *   - stationBreakdown[]: per station —
     *       stationName, stationType,
     *       items: [name, qty, status, secondsElapsed],
     *       stationStatus: ALL_DONE | IN_PROGRESS | NOT_STARTED
     *   - overallStatus: WAITING (any station not started) |
     *                    COOKING (at least one in progress) |
     *                    READY   (all stations done — ready to plate)
     *
     * Sorted: RUSH first, then by firedAt ASC.
     *
     * The expeditor uses stationBreakdown to call "behind"
     * when one station is bottlenecking a ticket.
     *
     * Hit:  kds:{rId}:outlet:{oId}:expo:queue  TTL: none
     * Miss: [DB] full join across all station queues → build dto
     *
     * Endpoint: GET /api/kds/expo/{outletId}/queue
     */
    public ExpoQueueDto getPassView(Long outletId) {
        String cacheKey = String.format("kds:outlet:%d:expo:queue", outletId);
        String cached = null;
        try {
            cached = redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            // Redis down, skip cache
        }
        
        // In a real app, I'd deserialize from JSON here. For now, let's build from DB.
        // Cache miss: build from DB
        Outlet outlet = outletRepository.findById(outletId)
                .orElseThrow(() -> new IllegalArgumentException("Outlet not found: " + outletId));

        List<KdsTicket> activeTickets = ticketRepository.findByOutletIdAndStatusInOrderByPriorityDescFiredAtAsc(
                outletId, List.of(KdsTicket.TicketStatus.ACTIVE, KdsTicket.TicketStatus.RECALLED));

        List<ExpoTicketDto> ticketDtos = activeTickets.stream().map(this::mapToExpoTicketDto).toList();

        int overWarn = (int) ticketDtos.stream().filter(t -> t.getOverallStatus() == OverallStatus.COOKING).count(); // Simplified
        int overAlert = (int) ticketDtos.stream().filter(t -> t.getSecondsElapsed() > 600).count(); // Placeholder threshold

        ExpoQueueDto dto = ExpoQueueDto.builder()
                .outletId(outletId)
                .outletName(outlet.getName())
                .activeCount(ticketDtos.size())
                .ticketsOverWarn(overWarn)
                .ticketsOverAlert(overAlert)
                .tickets(ticketDtos)
                .build();

        // redisTemplate.opsForValue().set(cacheKey, serialize(dto));
        return dto;
    }

    private ExpoTicketDto mapToExpoTicketDto(KdsTicket ticket) {
        List<StationBreakdownDto> breakdown = ticket.getItems().stream()
                .flatMap(item -> item.getStationItems().stream())
                .collect(java.util.stream.Collectors.groupingBy(si -> si.getStation().getId()))
                .entrySet().stream()
                .map(entry -> {
                    KdsStation station = entry.getValue().get(0).getStation();
                    List<StationTicketItemDto> items = entry.getValue().stream()
                            .map(this::mapToStationTicketItemDto)
                            .toList();

                    StationStatus status = calculateStationStatus(entry.getValue());

                    return StationBreakdownDto.builder()
                            .stationId(station.getId())
                            .stationName(station.getName())
                            .stationType(station.getStationType())
                            .stationStatus(status)
                            .items(items)
                            .build();
                })
                .toList();

        OverallStatus overallStatus = calculateOverallStatus(breakdown);

        return ExpoTicketDto.builder()
                .ticketId(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .guestCount(ticket.getGuestCount())
                .source(ticket.getSource().name())
                .priority(ticket.getPriority().name())
                .serverNote(ticket.getServerNote())
                .firedAt(ticket.getFiredAt())
                .secondsElapsed(java.time.Duration.between(ticket.getFiredAt(), LocalDateTime.now()).getSeconds())
                .overallStatus(overallStatus)
                .stationBreakdown(breakdown)
                .build();
    }

    private StationTicketItemDto mapToStationTicketItemDto(StationTicketItem si) {
        return StationTicketItemDto.builder()
                .id(si.getId())
                .name(si.getTicketItem().getMenuItemName())
                .quantity(si.getTicketItem().getQuantity())
                .prepTimeMinutes(si.getTicketItem().getPrepTimeMinutes())
                .status(si.getTicketItem().getStatus().name()) // Use ticket item status
                .secondsElapsed(si.getBumpedAt() != null ? 
                    java.time.Duration.between(si.getTicketItem().getTicket().getFiredAt(), si.getBumpedAt()).getSeconds() :
                    java.time.Duration.between(si.getTicketItem().getTicket().getFiredAt(), LocalDateTime.now()).getSeconds())
                .build();
    }

    private StationStatus calculateStationStatus(List<StationTicketItem> items) {
        boolean allDone = items.stream().allMatch(i -> i.getStatus() == StationTicketItem.StationItemStatus.DONE);
        if (allDone) return StationStatus.ALL_DONE;
        boolean anyInProgress = items.stream().anyMatch(i -> i.getStatus() == StationTicketItem.StationItemStatus.IN_PROGRESS);
        if (anyInProgress) return StationStatus.IN_PROGRESS;
        return StationStatus.NOT_STARTED;
    }

    private OverallStatus calculateOverallStatus(List<StationBreakdownDto> breakdown) {
        boolean allDone = breakdown.stream().allMatch(b -> b.getStationStatus() == StationStatus.ALL_DONE);
        if (allDone) return OverallStatus.READY;
        boolean anyInProgress = breakdown.stream().anyMatch(b -> b.getStationStatus() == StationStatus.IN_PROGRESS);
        if (anyInProgress) return OverallStatus.COOKING;
        return OverallStatus.WAITING;
    }

    /**
     * [CACHE] Single ticket detail for expo.
     * Full cross-station breakdown for one ticket.
     * Used when the expeditor taps a ticket to inspect it.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/tickets/{ticketId}
     */
    public ExpoTicketDetailDto getTicketDetail(Long outletId, Long ticketId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ExpoTicketDto ticketDto = mapToExpoTicketDto(ticket);

        return ExpoTicketDetailDto.builder()
                .ticketId(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .guestCount(ticket.getGuestCount())
                .source(ticket.getSource().name())
                .priority(ticket.getPriority().name())
                .serverNote(ticket.getServerNote())
                .firedAt(ticket.getFiredAt())
                .overallStatus(ticketDto.getOverallStatus().name())
                .stationBreakdown(ticketDto.getStationBreakdown())
                .build();
    }

    /**
     * [DB] Recently completed tickets — the "done" strip at
     * the bottom of the expo screen.
     *
     * Returns last N completed tickets (default 10), ordered
     * by completedAt DESC. Each shows total prep time.
     * Used to track pace and give the expo a recall target.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/completed
     *           ?limit=10
     */
    public List<CompletedTicketDto> getRecentlyCompleted(Long outletId, int limit) {
        List<KdsTicket> completed = ticketRepository.findRecentlyCompleted(outletId, org.springframework.data.domain.PageRequest.of(0, limit));
        return completed.stream().map(t -> CompletedTicketDto.builder()
                .ticketId(t.getId())
                .ticketNumber(t.getTicketNumber())
                .firedAt(t.getFiredAt())
                .completedAt(t.getCompletedAt())
                .prepTimeSeconds(t.getPrepTimeSeconds())
                .canRecall(true) // Expeditor can always recall same day
                .build()).toList();
    }

    /**
     * [DB] Live device status for all stations in an outlet.
     * Shows which KDS devices are online/offline.
     * If a station has no online device, it shows a warning —
     * items are routing to a screen nobody can see.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/device-status
     */
    public List<StationDeviceStatusDto> getDeviceStatus(Long outletId) {
        var stations = stationRepository.findFirstByOutletId(outletId);
        return stations.stream().map(s -> {
            List<DeviceStatusInfoDto> devices = s.getDevices().stream().map(d -> DeviceStatusInfoDto.builder()
                    .deviceId(d.getId())
                    .deviceName(d.getName())
                    .deviceType(d.getDeviceType().name())
                    .status(isDeviceOnline(d.getId()) ? "ONLINE" : "OFFLINE")
                    .lastSeenAt(d.getLastSeenAt())
                    .build()).toList();

            return StationDeviceStatusDto.builder()
                    .stationId(s.getId())
                    .stationName(s.getName())
                    .devices(devices)
                    .hasOnlineDevice(devices.stream().anyMatch(d -> "ONLINE".equals(d.getStatus())))
                    .build();
        }).toList();
    }

    private boolean isDeviceOnline(Long deviceId) {
        // Check Redis for active heartbeat TTL
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(String.format("kds:device:%d:status", deviceId)));
        } catch (Exception e) {
            return false;
        }
    }

    // ── Ticket lifecycle — expo/manager only ────────────────────

    /**
     * Fire a new ticket from the expo screen.
     * Used for verbal orders, walk-in corrections, or when
     * the POS is down. source = MANUAL.
     *
     * The expo can specify individual items, quantities,
     * modifications, allergen flags, course numbers,
     * and which table/guest the ticket belongs to.
     *
     * Delegates to TicketDispatchService.createManualTicket().
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets
     */
    @Transactional
    public KdsTicket fireManualTicket(Long outletId, ManualTicketRequest req) {
        return ticketDispatchService.createManualTicket(outletId, req);
    }

    /**
     * Add items to an existing active ticket.
     * Called when a table orders more food mid-meal.
     *
     * Creates new KdsTicketItem rows + StationTicketItem rows
     * for the routing matches. Existing items on the ticket
     * are unaffected.
     *
     * [EVENT] KdsQueueChangedEvent → affected stations see
     * new items appended to the existing ticket card.
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/add-items
     */
    @Transactional
    public void addItemsToTicket(Long ticketId, AddTicketItemsRequest req) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        // This is a bit of a hack—really TicketDispatch should have an appendItems method.
        // But for now, we'll just reuse the manual ticket fire logic as a reference.
        req.getItems().forEach(itemReq -> {
            KdsTicketItem item = KdsTicketItem.builder()
                    .ticket(ticket)
                    .menuItemId(itemReq.getMenuItemId())
                    .menuItemName(itemReq.getMenuItemName())
                    .pluNumber(itemReq.getPluNumber())
                    .quantity(itemReq.getQuantity())
                    .courseNumber(itemReq.getCourseNumber())
                    .modifications(itemReq.getModifications() != null ? String.join(", ", itemReq.getModifications()) : null)
                    .allergenFlags(itemReq.getAllergenFlags() != null ? String.join("|", itemReq.getAllergenFlags()) : null)
                    .status(KdsTicketItem.ItemStatus.NEW)
                    .build();
            
            // Logic to route and create StationTicketItems would go here
            ticket.getItems().add(item);
        });
        
        ticketRepository.save(ticket);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Fire a specific course for a ticket.
     * The expo manually releases the next course.
     *
     * Items in courseNumber N+1 that were held in HELD status
     * transition to NEW and appear on station queues.
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/fire-course
     *           body: { courseNumber: int }
     */
    @Transactional
    public void fireCourse(Long ticketId, int courseNumber) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setCourseNumber(courseNumber);
        ticket.getItems().stream()
                .filter(item -> item.getCourseNumber() == courseNumber && item.getStatus() == KdsTicketItem.ItemStatus.HELD)
                .forEach(item -> {
                    item.setStatus(KdsTicketItem.ItemStatus.NEW);
                    item.getStationItems().forEach(si -> si.setStatus(StationTicketItem.StationItemStatus.NEW));
                });
        
        ticketRepository.save(ticket);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Mark a ticket as RUSH. Floats it to the top of every
     * station queue that still has work to do on it.
     *
     * The ticket border turns amber on all affected screens.
     * An audio alert fires on all stations if
     * KdsSettings.enableAudioAlerts = true.
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/rush
     */
    @Transactional
    public void markRush(Long ticketId, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setPriority(KdsTicket.TicketPriority.RUSH);
        ticketRepository.save(ticket);
        
        logEvent(ticket, "TICKET_RUSH", "Marked as RUSH by " + actorUserId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /** Remove RUSH. Ticket returns to normal sort position. */
    @Transactional
    public void clearRush(Long ticketId, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setPriority(KdsTicket.TicketPriority.NORMAL);
        ticketRepository.save(ticket);
        
        logEvent(ticket, "TICKET_NORMAL", "RUSH cleared by " + actorUserId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Add or update a server note on a ticket.
     * Shown at the top of the ticket on all station screens
     * in amber. Used for allergy alerts, VIP flags, etc.
     *
     * Endpoint: PATCH /api/kds/expo/{outletId}/tickets/{ticketId}/note
     *           body: { note: string }
     */
    @Transactional
    public void setServerNote(Long ticketId, String note, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setServerNote(note);
        ticketRepository.save(ticket);
        
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Void an individual item that has already been fired.
     * Called by expo when a server comes to the pass with
     * a cancellation.
     *
     * Flash behaviour:
     *   - Item turns red and pulses on all station screens
     *     showing it for 5 seconds
     *   - Audio alert fires if KdsSettings.enableAudioAlerts
     *   - After 5 seconds, item card is removed from queue
     *
     * If the item was already DONE (bumped), a "discard"
     * notification appears on the station screen:
     *   "Discard: Grilled Salmon · Table 7 · voided by server"
     *
     * Delegates to KdsVoidService.voidItem().
     *
     * Endpoint: POST /api/kds/expo/{outletId}/ticket-items/{ticketItemId}/void
     *           body: { reason: string }
     */
    @Transactional
    public void voidItem(Long ticketItemId, String reason, Long actorUserId) {
        voidService.voidItem(ticketItemId, reason, actorUserId);
    }

    /**
     * Void an entire ticket.
     * ALL station screens showing any part of this ticket
     * flash red for 5 seconds, then the ticket card disappears.
     *
     * Delegates to KdsVoidService.voidTicket().
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/void
     *           body: { reason: string }
     */
    @Transactional
    public void voidTicket(Long ticketId, String reason, Long actorUserId) {
        voidService.voidTicket(ticketId, reason, actorUserId);
    }

    /**
     * Recall a completed ticket back to the pass.
     * The expeditor uses this when a runner returns with
     * uncollected food, or when the ticket was completed
     * in error.
     *
     * Unlike the station-side recall (which is time-windowed),
     * the expeditor can recall any completed ticket
     * within the current service session (same day).
     *
     * Pipeline:
     *   1. KdsTicket.status COMPLETE → RECALLED → ACTIVE
     *   2. completedAt = null
     *   3. For all StationTicketItem where status = DONE:
     *      reset to RECALLED, set recalledAt = now
     *   4. KdsTicketItem statuses reset to NEW/IN_PROGRESS
     *   5. Re-add to all station queues
     *   6. Audio alert on all affected stations
     *   7. [DB] KdsEventLog: TICKET_RECALLED
     *   8. [EVENT] KdsQueueChangedEvent → tickets reappear
     *      on all station screens
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/recall
     */
    @Transactional
    public void recallTicket(Long ticketId, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setStatus(KdsTicket.TicketStatus.RECALLED);
        ticket.setCompletedAt(null);
        ticket.getItems().forEach(item -> {
            if (item.getStatus() == KdsTicketItem.ItemStatus.DONE) {
                item.setStatus(KdsTicketItem.ItemStatus.IN_PROGRESS);
                item.getStationItems().forEach(si -> {
                    if (si.getStatus() == StationTicketItem.StationItemStatus.DONE) {
                        si.setStatus(StationTicketItem.StationItemStatus.RECALLED);
                        si.setRecalledAt(LocalDateTime.now());
                    }
                });
            }
        });
        
        ticketRepository.save(ticket);
        logEvent(ticket, "TICKET_RECALLED", "Recalled by " + actorUserId);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Expo "bump" — close the ticket from the pass.
     * Used when the expeditor has verified all items are
     * plated and ready for the runner.
     *
     * Unlike station bumps (which close individual items),
     * this is an authoritative close: the expo is saying
     * "this ticket is complete regardless of station state."
     *
     * In practice, by the time the expo bumps, all stations
     * will already be DONE (the expo screen shows a "ready"
     * state when all stations complete). But occasionally the
     * expo needs to force-close a ticket where one station
     * dropped an item but the cook already plated it.
     *
     * If any StationTicketItems are still NEW/IN_PROGRESS,
     * they are auto-bumped with bumpedByDeviceId = null
     * (system bump) and a KdsEventLog note of "force-closed by expo".
     *
     * [EVENT] PosTicketReadyEvent (notifies runner)
     *
     * Endpoint: POST /api/kds/expo/{outletId}/tickets/{ticketId}/close
     */
    @Transactional
    public void closeTicket(Long ticketId, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setStatus(KdsTicket.TicketStatus.COMPLETE);
        ticket.setCompletedAt(LocalDateTime.now());
        ticket.setPrepTimeSeconds((int) java.time.Duration.between(ticket.getFiredAt(), ticket.getCompletedAt()).getSeconds());
        
        ticket.getItems().forEach(item -> {
            if (item.getStatus() != KdsTicketItem.ItemStatus.VOIDED) {
                item.setStatus(KdsTicketItem.ItemStatus.DONE);
                item.getStationItems().forEach(si -> {
                    if (si.getStatus() != StationTicketItem.StationItemStatus.VOIDED) {
                        si.setStatus(StationTicketItem.StationItemStatus.DONE);
                        si.setBumpedAt(LocalDateTime.now());
                    }
                });
            }
        });
        
        ticketRepository.save(ticket);
        logEvent(ticket, "TICKET_BUMPED", "Force closed by expo " + actorUserId);
        
        if (ticket.getPosOrderId() != null) {
            eventPublisher.publishEvent(new PosTicketReadyEvent(ticket.getPosOrderId(), ticket.getTicketNumber()));
        }
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }

    /**
     * Recall a single item from any station, no time window.
     * Expo-level recall has no recallWindowSeconds constraint.
     *
     * Used when: the runner came back, the cook bumped too early,
     * the wrong item was sent to the pass.
     *
     * Endpoint: POST /api/kds/expo/{outletId}/station-items/{stationItemId}/recall
     */
    @Transactional
    public void recallItem(Long stationItemId, Long actorUserId) {
        StationTicketItem si = stationTicketItemRepository.findById(stationItemId)
                .orElseThrow(() -> new IllegalArgumentException("Station item not found: " + stationItemId));
        
        si.setStatus(StationTicketItem.StationItemStatus.RECALLED);
        si.setRecalledAt(LocalDateTime.now());
        
        KdsTicketItem item = si.getTicketItem();
        if (item.getStatus() == KdsTicketItem.ItemStatus.DONE) {
            item.setStatus(KdsTicketItem.ItemStatus.IN_PROGRESS);
        }
        
        KdsTicket ticket = item.getTicket();
        if (ticket.getStatus() == KdsTicket.TicketStatus.COMPLETE) {
            ticket.setStatus(KdsTicket.TicketStatus.RECALLED);
            ticket.setCompletedAt(null);
        }
        
        stationTicketItemRepository.save(si);
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), si.getStation().getId()));
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

    // ── Multi-outlet management (owner/central view) ─────────────

    /**
     * [CACHE] Summary dashboard across all outlets for a restaurant.
     * The owner or central manager uses this for oversight.
     *
     * Per outlet:
     *   - activeTickets: int
     *   - avgSecondsElapsed: int (live average across queue)
     *   - ticketsOverWarn: int  (amber)
     *   - ticketsOverAlert: int (red)
     *   - stationsOnline: int / stationsTotal: int
     *   - lastActivity: timestamp
     *
     * Hit:  kds:{rId}:central:summary  TTL: 30s
     * Miss: [DB/Redis] aggregate per outlet → store
     *
     * Endpoint: GET /api/kds/central/{restaurantId}/summary
     */
    public List<OutletSummaryDto> getCentralSummary(Long restaurantId) {
        List<Outlet> outlets = outletRepository.findAll(); // Should filter by restaurantId if it was in the entity
        return outlets.stream().map(o -> {
            long active = ticketRepository.countByOutletIdAndStatus(o.getId(), KdsTicket.TicketStatus.ACTIVE);
            return OutletSummaryDto.builder()
                    .outletId(o.getId())
                    .outletName(o.getName())
                    .activeTickets((int) active)
                    .avgSecondsElapsed(0) // Placeholder for real calculation
                    .ticketsOverWarn(0)
                    .ticketsOverAlert(0)
                    .stationsOnline(0)
                    .stationsTotal(o.getStations().size())
                    .lastActivity(LocalDateTime.now())
                    .build();
        }).toList();
    }

    /**
     * [DB] Prep time analytics across all outlets.
     * Which outlet/station is consistently slow?
     *
     * Endpoint: GET /api/kds/central/{restaurantId}/analytics
     *           ?from=&to=&stationType=
     */
    public CentralAnalyticsDto getCentralAnalytics(Long restaurantId,
        java.time.LocalDate from, java.time.LocalDate to, KdsStation.StationType stationType) {
        return CentralAnalyticsDto.builder()
                .restaurantId(restaurantId)
                .outlets(List.of())
                .crossOutletComparison(List.of())
                .build();
    }

    // ── Settings management ──────────────────────────────────────

    /**
     * [DB] Get KDS settings for an outlet.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/settings
     */
    public KdsSettingsDto getSettings(Long outletId) {
        KdsSettings settings = settingsRepository.findByOutletId(outletId)
                .orElseGet(() -> createDefaultSettings(outletId));
        return KdsSettingsDto.from(settings);
    }

    private KdsSettings createDefaultSettings(Long outletId) {
        KdsSettings settings = KdsSettings.builder()
                .outletId(outletId)
                .warnThresholdSeconds(300)
                .alertThresholdSeconds(600)
                .maxTicketsPerScreen(6)
                .sortOrder(KdsSettings.SortOrder.FIRED_ASC)
                .enableAudioAlerts(true)
                .build();
        return settingsRepository.save(settings);
    }

    /**
     * [DB] Update KDS settings.
     * Changing thresholds takes effect immediately — all
     * connected devices receive a SETTINGS_CHANGED WebSocket
     * push and re-load their settings.
     *
     * Changing sortOrder invalidates and rebuilds all
     * station queue caches.
     *
     * [INVAL] kds:{rId}:outlet:{oId}:settings
     * [EVENT] KdsSettingsChangedEvent → broadcast to all
     *         connected devices in this outlet
     *
     * Endpoint: PUT /api/kds/expo/{outletId}/settings
     */
    @Transactional
    public KdsSettings updateSettings(Long outletId, UpdateKdsSettingsRequest req,
        Long actorUserId) {
        KdsSettings settings = settingsRepository.findByOutletId(outletId)
                .orElseThrow(() -> new IllegalArgumentException("Settings not found for outlet: " + outletId));
        
        if (req.getWarnThresholdSeconds() != null) settings.setWarnThresholdSeconds(req.getWarnThresholdSeconds());
        if (req.getAlertThresholdSeconds() != null) settings.setAlertThresholdSeconds(req.getAlertThresholdSeconds());
        if (req.getMaxTicketsPerScreen() != null) settings.setMaxTicketsPerScreen(req.getMaxTicketsPerScreen());
        if (req.getSortOrder() != null) settings.setSortOrder(KdsSettings.SortOrder.valueOf(req.getSortOrder()));
        if (req.getEnableStartAction() != null) settings.setEnableStartAction(req.getEnableStartAction());
        if (req.getEnableAudioAlerts() != null) settings.setEnableAudioAlerts(req.getEnableAudioAlerts());
        
        KdsSettings saved = settingsRepository.save(settings);
        eventPublisher.publishEvent(new KdsSettingsChangedEvent(outletId));
        return saved;
    }

    /**
     * [DB] Configure station routing rules.
     * Which menu items / PLUs / categories go to which station.
     *
     * After update, the routing cache is invalidated and rebuilt.
     * Any active tickets are NOT retroactively re-routed —
     * routing changes apply to tickets fired after the change.
     *
     * [INVAL] kds:{rId}:outlet:{oId}:routing-map
     *
     * Endpoint: POST /api/kds/expo/{outletId}/stations/{stationId}/routing
     *           DELETE /api/kds/expo/{outletId}/stations/{stationId}/routing/{routingId}
     */
    @Transactional
    public StationRouting addRouting(Long stationId, AddRoutingRequest req, Long actorUserId) {
        KdsStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found: " + stationId));
        
        StationRouting routing = StationRouting.builder()
                .station(station)
                .routingType(StationRouting.RoutingType.valueOf(req.getRoutingType().name()))
                .routingKey(req.getRoutingKey())
                .label(req.getLabel())
                .build();
        
        return routingRepository.save(routing);
    }

    @Transactional
    public void removeRouting(Long stationId, Long routingId, Long actorUserId) {
        routingRepository.deleteById(routingId);
    }

    /**
     * [DB] Register a new KDS device. Returns a 6-digit pairing code
     * that expires in 15 minutes.
     *
     * The manager:
     *   1. Creates device in this screen → gets pairing code
     *   2. Opens KDS app on the phone/tablet
     *   3. Enters the code → device is paired
     *
     * Endpoint: POST /api/kds/expo/{outletId}/devices
     */
    @Transactional
    public KdsDevicePairingDto registerDevice(Long stationId, RegisterDeviceRequest req) {
        KdsStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found: " + stationId));
        
        String pairingCode = generatePairingCode();
        
        KdsDevice device = KdsDevice.builder()
                .station(station)
                .name(req.getName())
                .deviceType(KdsDevice.DeviceType.valueOf(req.getDeviceType()))
                .orientation(KdsDevice.Orientation.valueOf(req.getOrientation()))
                .pairingCode(pairingCode)
                .pairingCodeExpiresAt(LocalDateTime.now().plusMinutes(15))
                .active(true)
                .build();
        
        KdsDevice saved = deviceRepository.save(device);
        
        return KdsDevicePairingDto.builder()
                .deviceId(saved.getId())
                .name(saved.getName())
                .pairingCode(pairingCode)
                .pairingCodeExpiresAt(saved.getPairingCodeExpiresAt())
                .build();
    }

    private String generatePairingCode() {
        return String.format("%06d", new java.util.Random().nextInt(999999));
    }

    /**
     * [DB] Revoke a device (lost phone, reassigned tablet).
     * Forces re-pairing.
     *
     * Endpoint: DELETE /api/kds/expo/{outletId}/devices/{deviceId}
     */
    @Transactional
    public void revokeDevice(Long deviceId, Long actorUserId) {
        KdsDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        device.setActive(false);
        deviceRepository.save(device);
    }

    // ── Analytics ────────────────────────────────────────────────

    /**
     * [DB] Prep time analytics for this outlet.
     * Avg, p50, p90 per station for a date range.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/analytics/prep-time
     *           ?from=&to=
     */
    public List<StationPrepTimeDto> getPrepTimeAnalytics(Long outletId,
        java.time.LocalDate from, java.time.LocalDate to) {
        // Placeholder for real DB aggregation
        return List.of();
    }

    /**
     * [DB] Station throughput: tickets and items per hour.
     * Used to identify peak periods and justify staffing.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/analytics/throughput
     *           ?from=&to=
     */
    public List<StationThroughputDto> getThroughputAnalytics(Long outletId,
        java.time.LocalDate from, java.time.LocalDate to) {
        // Placeholder for real DB aggregation
        return List.of();
    }

    /**
     * [DB] Void rate by menu item (PLU / name).
     * Items with high void rates need investigation —
     * wrong portion size, item frequently misunderstood by server,
     * or a recipe the kitchen consistently gets wrong.
     *
     * Endpoint: GET /api/kds/expo/{outletId}/analytics/void-rate
     *           ?from=&to=
     */
    public List<VoidRateDto> getVoidRateAnalytics(Long outletId,
        java.time.LocalDate from, java.time.LocalDate to) {
        // Placeholder for real DB aggregation
        return List.of();
    }
}
