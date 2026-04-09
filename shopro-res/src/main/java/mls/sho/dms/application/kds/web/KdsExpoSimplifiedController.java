package mls.sho.dms.application.kds.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.service.ExpoKdsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SIMPLIFIED KDS EXPO CONTROLLER
 * Maps to /api/kds/expo/{expoId}/... as requested.
 */
@RestController
@RequestMapping("/api/kds/expo/{expoId}")
@RequiredArgsConstructor
public class KdsExpoSimplifiedController {

    private final ExpoKdsService expoService;

    /**
     * GET /api/kds/expo/{expoId}/queue
     */
    @GetMapping("/queue")
    // @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<ExpoQueueDto> getQueue(
        @PathVariable Long expoId
    ) {
        // expoId maps to outletId in the service
        return ResponseEntity.ok(expoService.getPassView(expoId));
    }

    /**
     * GET /api/kds/expo/{expoId}/completed
     */
    @GetMapping("/completed")
    // @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<CompletedTicketDto>> getRecentlyCompleted(
        @PathVariable Long expoId,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(expoService.getRecentlyCompleted(expoId, limit));
    }

    /**
     * GET /api/kds/expo/{expoId}/device-status
     */
    @GetMapping("/device-status")
    // @PreAuthorize("hasAnyRole('EXPO', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<StationDeviceStatusDto>> getDeviceStatus(
        @PathVariable Long expoId
    ) {
        return ResponseEntity.ok(expoService.getDeviceStatus(expoId));
    }
}
