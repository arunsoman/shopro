package mls.sho.dms.application.service.floor.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.floor.ReservationService;
import mls.sho.dms.entity.floor.Reservation;
import mls.sho.dms.entity.floor.ReservationStatus;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.repository.floor.ReservationRepository;
import mls.sho.dms.repository.floor.TableShapeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableShapeRepository tableShapeRepository;

    @Override
    public ReservationResponse createReservation(CreateReservationRequest request, String performedBy) {
        TableShape table = tableShapeRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));

        if (request.partySize() > table.getCapacity() * 1.5) { // some leeway
            throw new BusinessRuleException("Party size greatly exceeds table capacity.");
        }

        // Ideally here we'd check for overlapping reservations, e.g., within 2 hours of this start time.
        // For simplicity, we skip full clash-detection and allow creation (Host manages conflicts).
        
        Reservation r = new Reservation();
        r.setTable(table);
        r.setCustomerName(request.guestName());
        r.setPartySize(request.partySize());
        r.setPhoneNumber(request.guestPhone());
        r.setReservationTime(request.reservationStart());
        r.setStatus(ReservationStatus.CONFIRMED);
        
        return mapToResponse(reservationRepository.save(r));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getUpcomingReservations(UUID tableId) {
        TableShape table = tableShapeRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));

        return reservationRepository.findUpcomingByTable(
                table,
                Instant.now(),
                List.of(ReservationStatus.CONFIRMED, ReservationStatus.SEATED)
        ).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ReservationResponse cancelReservation(UUID id, String reason, String performedBy) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));

        if (r.getStatus() == ReservationStatus.CANCELLED || r.getStatus() == ReservationStatus.NO_SHOW) {
             throw new BusinessRuleException("Reservation already " + r.getStatus());
        }

        r.setStatus(ReservationStatus.CANCELLED);
        r.setCancellationReason(reason);
        return mapToResponse(reservationRepository.save(r));
    }

    @Override
    public ReservationResponse confirmReservation(UUID id, String performedBy) {
         Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));
         
         if (r.getStatus() != ReservationStatus.CONFIRMED) {
              throw new BusinessRuleException("Only confirmed reservations can be seated/arrived from here.");
         }
         r.setStatus(ReservationStatus.SEATED);
         return mapToResponse(reservationRepository.save(r));
    }

    private ReservationResponse mapToResponse(Reservation r) {
        String createdBy = null;
        if (r.getCreatedBy() != null) {
            createdBy = r.getCreatedBy().getFullName();
        }

        return new ReservationResponse(
            r.getId(),
            r.getTable().getId(),
            r.getTable().getName(),
            r.getCustomerName(),
            r.getPartySize(),
            r.getPhoneNumber(),
            r.getReservationTime(),
            r.getStatus().name(),
            r.getCancellationReason(),
            createdBy,
            r.getCreatedAt()
        );
    }
}
