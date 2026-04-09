package mls.sho.dms.application.kds.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.KdsSettings;
import mls.sho.dms.application.kds.entity.KdsStation;
import mls.sho.dms.application.kds.entity.KdsTicket;
import mls.sho.dms.application.kds.entity.StationRouting;
import mls.sho.dms.application.kds.security.UserPrincipal;
import mls.sho.dms.application.kds.service.ExpoKdsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * EXPEDITOR KDS CONTROLLER
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/kds/expo")
@RequiredArgsConstructor
public class ExpoKdsController {

    private final ExpoKdsService expoService;

    // ── Pass view ────────────────────────────────────────────────

    /**
     * GET /api/kds/expo/{outletId}/queue
     *
     * The full pass view. All active tickets, all stations,
     * with station-by-station status breakdown per ticket.
     *
     * Auth: User JWT with role EXPO or MANAGER or OWNER.
     *
     * Response: ExpoQueueDto
     */
    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<ExpoQueueDto> getPassView(
        @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(expoService.getPassView(restaurantId));
    }

    /**
     * GET /api/kds/expo/{restaurantId}/tickets/{ticketId}
     *
     * Full ticket detail including every item at every station.
     * Used when the expeditor taps a ticket to inspect.
     *
     * Response: ExpoTicketDetailDto
     */
    @GetMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<ExpoTicketDetailDto> getTicketDetail(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId
    ) {
        return ResponseEntity.ok(expoService.getTicketDetail(restaurantId, ticketId));
    }

    /**
     * GET /api/kds/expo/{restaurantId}/completed
     *
     * Recently completed tickets shown in the done strip.
     * Default last 10. Includes total prep time per ticket.
     *
     * Query param: limit (default 10, max 50)
     * Response: CompletedTicketDto[]
     */
    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<CompletedTicketDto>> getRecentlyCompleted(
        @PathVariable Long restaurantId,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(expoService.getRecentlyCompleted(restaurantId, limit));
    }

    /**
     * GET /api/kds/expo/{restaurantId}/device-status
     *
     * Live status of all KDS devices across all stations.
     *
     * Response: StationDeviceStatusDto[]
     */
    @GetMapping("/device-status")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<StationDeviceStatusDto>> getDeviceStatus(
        @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(expoService.getDeviceStatus(restaurantId));
    }

    // ── Ticket lifecycle ─────────────────────────────────────────

    /**
     * POST /api/kds/expo/{restaurantId}/tickets
     *
     * Fire a manual ticket from the pass.
     *
     * Body: ManualTicketRequest
     * Response: ExpoTicketDetailDto (newly fired ticket)
     * 201 Created
     */
    @PostMapping("/tickets")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<ExpoTicketDetailDto> fireManualTicket(
        @PathVariable Long restaurantId,
        @RequestBody @Valid ManualTicketRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        KdsTicket ticket = expoService.fireManualTicket(restaurantId, req);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(expoService.getTicketDetail(restaurantId, ticket.getId()));
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/add-items
     *
     * Add more items to an existing active ticket.
     *
     * Body: AddTicketItemsRequest
     * Response: ExpoTicketDetailDto (updated)
     */
    @PostMapping("/tickets/{ticketId}/add-items")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<ExpoTicketDetailDto> addItemsToTicket(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @RequestBody @Valid AddTicketItemsRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.addItemsToTicket(ticketId, req);
        return ResponseEntity.ok(expoService.getTicketDetail(restaurantId, ticketId));
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/fire-course
     *
     * Release the next course.
     *
     * Body: { courseNumber: int }
     * Response: 204 No Content
     */
    @PostMapping("/tickets/{ticketId}/fire-course")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> fireCourse(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @RequestBody @Valid FireCourseRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.fireCourse(ticketId, req.getCourseNumber());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/rush
     *
     * Elevate to RUSH priority.
     *
     * Body: empty
     * Response: 204 No Content
     */
    @PostMapping("/tickets/{ticketId}/rush")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> markRush(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.markRush(ticketId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/kds/expo/{restaurantId}/tickets/{ticketId}/rush
     *
     * Clear RUSH priority.
     *
     * Response: 204 No Content
     */
    @DeleteMapping("/tickets/{ticketId}/rush")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> clearRush(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.clearRush(ticketId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/kds/expo/{restaurantId}/tickets/{ticketId}/note
     *
     * Update the server note on a live ticket.
     *
     * Body: { note: string }
     * Response: 204 No Content
     */
    @PatchMapping("/tickets/{ticketId}/note")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> setServerNote(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @RequestBody @Valid SetNoteRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.setServerNote(ticketId, req.getNote(), actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/ticket-items/{ticketItemId}/void
     *
     * Void a single item.
     *
     * Body: { reason: string }
     * Response: 204 No Content
     */
    @PostMapping("/ticket-items/{ticketItemId}/void")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> voidItem(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketItemId,
        @RequestBody @Valid VoidRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.voidItem(ticketItemId, req.getReason(), actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/void
     *
     * Void an entire ticket.
     *
     * Body: { reason: string }
     * Response: 204 No Content
     */
    @PostMapping("/tickets/{ticketId}/void")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> voidTicket(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @RequestBody @Valid VoidRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.voidTicket(ticketId, req.getReason(), actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/recall
     *
     * Recall a completed ticket back to the pass.
     *
     * Body: empty
     * Response: 204 No Content
     */
    @PostMapping("/tickets/{ticketId}/recall")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> recallTicket(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.recallTicket(ticketId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/tickets/{ticketId}/close
     *
     * Authoritative close from the pass.
     *
     * Body: empty
     * Response: 204 No Content
     */
    @PostMapping("/tickets/{ticketId}/close")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<Void> closeTicket(
        @PathVariable Long restaurantId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.closeTicket(ticketId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/station-items/{stationItemId}/recall
     *
     * Recall a single item from any station.
     *
     * Body: empty
     * Response: RecallResultDto
     */
    @PostMapping("/station-items/{stationItemId}/recall")
    @PreAuthorize("hasAnyRole('EXPO', 'MANAGER')")
    public ResponseEntity<RecallResultDto> recallItem(
        @PathVariable Long restaurantId,
        @PathVariable Long stationItemId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.recallItem(stationItemId, actor.getUserId());
        return ResponseEntity.ok(RecallResultDto.builder()
                .stationItemId(stationItemId)
                .status("RECALLED")
                .build());
    }

    // ── Settings & device management ─────────────────────────────

    /**
     * GET /api/kds/expo/{restaurantId}/settings
     *
     * Fetch all KDS settings for this restaurant.
     */
    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<KdsSettingsDto> getSettings(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(expoService.getSettings(restaurantId));
    }

    /**
     * PUT /api/kds/expo/{restaurantId}/settings
     *
     * Update KDS settings.
     */
    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<KdsSettingsDto> updateSettings(
        @PathVariable Long restaurantId,
        @RequestBody @Valid UpdateKdsSettingsRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        KdsSettings updated = expoService.updateSettings(restaurantId, req, actor.getUserId());
        return ResponseEntity.ok(KdsSettingsDto.from(updated));
    }

    /**
     * POST /api/kds/expo/{restaurantId}/stations/{stationId}/routing
     */
    @PostMapping("/stations/{stationId}/routing")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<StationRoutingDto> addRouting(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @RequestBody @Valid AddRoutingRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        StationRouting routing = expoService.addRouting(stationId, req, actor.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(StationRoutingDto.from(routing));
    }

    /**
     * DELETE /api/kds/expo/{restaurantId}/stations/{stationId}/routing/{routingId}
     */
    @DeleteMapping("/stations/{stationId}/routing/{routingId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> removeRouting(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long routingId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.removeRouting(stationId, routingId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/kds/expo/{restaurantId}/devices
     */
    @PostMapping("/devices")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<KdsDevicePairingDto> registerDevice(
        @PathVariable Long restaurantId,
        @RequestBody @Valid RegisterDeviceRequest req,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(expoService.registerDevice(req.getStationId(), req));
    }

    /**
     * DELETE /api/kds/expo/{restaurantId}/devices/{deviceId}
     */
    @DeleteMapping("/devices/{deviceId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> revokeDevice(
        @PathVariable Long restaurantId,
        @PathVariable Long deviceId,
        @AuthenticationPrincipal UserPrincipal actor
    ) {
        expoService.revokeDevice(deviceId, actor.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Analytics ────────────────────────────────────────────────

    /**
     * GET /api/kds/expo/{restaurantId}/analytics/prep-time
     */
    @GetMapping("/analytics/prep-time")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<StationPrepTimeDto>> getPrepTimeAnalytics(
        @PathVariable Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(expoService.getPrepTimeAnalytics(restaurantId, from, to));
    }

    /**
     * GET /api/kds/expo/{restaurantId}/analytics/throughput
     */
    @GetMapping("/analytics/throughput")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<StationThroughputDto>> getThroughputAnalytics(
        @PathVariable Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(expoService.getThroughputAnalytics(restaurantId, from, to));
    }

    /**
     * GET /api/kds/expo/{restaurantId}/analytics/void-rate
     */
    @GetMapping("/analytics/void-rate")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<VoidRateDto>> getVoidRateAnalytics(
        @PathVariable Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(expoService.getVoidRateAnalytics(restaurantId, from, to));
    }
}
