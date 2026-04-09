package mls.sho.dms.web.controller.floor;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.service.floor.FloorPlanService;
import mls.sho.dms.application.service.floor.WaitlistService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/waitlist")
@RequiredArgsConstructor
@Tag(name = "Waitlist & Guest Seating", description = "Operations for host/hostess managing arriving guests")
public class WaitlistController {

    private final WaitlistService waitlistService;
    private final FloorPlanService floorPlanService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistEntryResponse addToWaitlist(@Valid @RequestBody CreateWaitlistEntryRequest request, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return waitlistService.addToWaitlist(request, user);
    }

    @GetMapping
    public List<WaitlistEntryResponse> getActiveWaitlist() {
        return waitlistService.getActiveWaitlist();
    }

    @PostMapping("/{id}/notify")
    public WaitlistEntryResponse notifyGuest(@PathVariable UUID id, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return waitlistService.notifyGuest(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromWaitlist(@PathVariable UUID id, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         waitlistService.removeFromWaitlist(id, user);
    }

    // --- Table Operational Actions ---

    // Using query param for waitlist entry to allow seating a walk-in without a waitlist entry if needed later
    @PostMapping("/tables/{tableId}/seat")
    public TableShapeResponse seatParty(
        @PathVariable UUID tableId,
        @RequestParam UUID waitlistEntryId,
        Principal principal
    ) {
         String user = principal != null ? principal.getName() : "system";
         return floorPlanService.seatParty(tableId, waitlistEntryId, user);
    }
    
    @PostMapping("/tables/{tableId}/clean")
    public TableShapeResponse markTableClean(@PathVariable UUID tableId, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return floorPlanService.markTableClean(tableId, user);
    }

    @GetMapping("/estimate")
    public int getWaitTimeEstimate(@RequestParam int partySize) {
        return floorPlanService.calculateEstimatedWaitTime(partySize);
    }

    @GetMapping("/tables/{tableId}/suggest-match")
    public WaitlistEntryResponse suggestMatch(@PathVariable UUID tableId) {
        return floorPlanService.suggestBestMatch(tableId);
    }
}
