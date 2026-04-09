package mls.sho.dms.application.kds.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.security.KdsDevicePrincipal;
import mls.sho.dms.application.kds.service.KdsSettingsService;
import mls.sho.dms.application.kds.service.StationKdsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import mls.sho.dms.application.kds.entity.KdsStation;

/**
 * STATION KDS CONTROLLER
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/kds/stations")
@RequiredArgsConstructor
public class StationKdsController {

    private final StationKdsService stationService;
    private final KdsSettingsService kdsSettingsService;
    private final mls.sho.dms.application.kds.repository.KdsStationRepository stationRepository;

    @GetMapping
    public ResponseEntity<List<KdsStation>> getStations(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(stationRepository.findAll());
    }

    // ── Queue reads ─────────────────────────────────────────────

    @GetMapping("/{stationId}/queue")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<StationQueuePageDto> getQueue(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.getQueuePage(stationId, device.getDeviceId())
        );
    }

    @GetMapping("/{stationId}/tickets/{ticketId}")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<StationTicketDto> getTicket(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.getTicket(stationId, ticketId)
        );
    }

    // ── Cook interactions ────────────────────────────────────────

    @PostMapping("/{stationId}/items/{stationItemId}/start")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<StationTicketItemDto> startItem(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long stationItemId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.startItem(stationId, stationItemId, device.getDeviceId())
        );
    }

    @PostMapping("/{stationId}/items/{stationItemId}/bump")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<BumpResultDto> bumpItem(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long stationItemId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.bumpItem(stationId, stationItemId, device.getDeviceId())
        );
    }

    @PostMapping("/{stationId}/tickets/{ticketId}/bump-all")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<BumpAllResultDto> bumpAll(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.bumpAll(stationId, ticketId, device.getDeviceId())
        );
    }

    @PostMapping("/{stationId}/items/{stationItemId}/recall")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<RecallResultDto> recallItem(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long stationItemId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        return ResponseEntity.ok(
            stationService.recallItem(stationId, stationItemId, device.getDeviceId())
        );
    }

    @PostMapping("/{stationId}/tickets/{ticketId}/recall-all")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<RecallAllResultDto> recallAll(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @PathVariable Long ticketId,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        stationService.recallAll(stationId, ticketId, device.getDeviceId());
        return ResponseEntity.ok(new RecallAllResultDto(ticketId));
    }

    // ── Device lifecycle ─────────────────────────────────────────

    @PostMapping("/{stationId}/heartbeat")
    @PreAuthorize("hasRole('KDS_DEVICE')")
    public ResponseEntity<HeartbeatResponseDto> heartbeat(
        @PathVariable Long restaurantId,
        @PathVariable Long stationId,
        @RequestBody HeartbeatRequestDto req,
        @AuthenticationPrincipal KdsDevicePrincipal device
    ) {
        stationService.heartbeat(device.getDeviceId());
        return ResponseEntity.ok(new HeartbeatResponseDto(
            System.currentTimeMillis(),
            kdsSettingsService.getSettingsVersion(stationId)
        ));
    }
}
