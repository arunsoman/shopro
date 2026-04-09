package mls.sho.dms.application.service.floor;

import mls.sho.dms.application.dto.floor.*;

import java.util.List;
import java.util.UUID;

public interface ReservationService {
    ReservationResponse createReservation(CreateReservationRequest request, String performedBy);
    List<ReservationResponse> getUpcomingReservations(UUID tableId);
    ReservationResponse cancelReservation(UUID id, String reason, String performedBy);
    ReservationResponse confirmReservation(UUID id, String performedBy);
}
