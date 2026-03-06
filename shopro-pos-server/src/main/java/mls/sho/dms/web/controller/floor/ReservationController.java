package mls.sho.dms.web.controller.floor;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.service.floor.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Advance Reservations", description = "Management of advance table bookings")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse createReservation(@Valid @RequestBody CreateReservationRequest request, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return reservationService.createReservation(request, user);
    }

    @GetMapping("/tables/{tableId}")
    public List<ReservationResponse> getUpcomingReservations(@PathVariable UUID tableId) {
         return reservationService.getUpcomingReservations(tableId);
    }

    @PostMapping("/{id}/confirm-seated")
    public ReservationResponse confirmReservationSeated(@PathVariable UUID id, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return reservationService.confirmReservation(id, user);
    }
    
    @DeleteMapping("/{id}")
    public ReservationResponse cancelReservation(@PathVariable UUID id, @RequestParam String reason, Principal principal) {
         String user = principal != null ? principal.getName() : "system";
         return reservationService.cancelReservation(id, reason, user);
    }
}
