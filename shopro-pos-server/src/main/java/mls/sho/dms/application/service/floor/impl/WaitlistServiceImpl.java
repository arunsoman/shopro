package mls.sho.dms.application.service.floor.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.floor.WaitlistService;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.floor.WaitlistEntry;
import mls.sho.dms.entity.floor.WaitlistStatus;
import mls.sho.dms.repository.floor.WaitlistEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class WaitlistServiceImpl implements WaitlistService {

    private final WaitlistEntryRepository waitlistEntryRepository;

    // A simplified wait time prediction: 15 mins per party ahead of the same size
    private static final int AVG_TURN_MINS_PER_HEAD = 15; 

    @Override
    public WaitlistEntryResponse addToWaitlist(CreateWaitlistEntryRequest request, String performedBy) {
        WaitlistEntry entry = new WaitlistEntry();
        entry.setCustomerName(request.guestName());
        entry.setPartySize(request.partySize());
        entry.setPhoneNumber(request.guestPhone());
        entry.setStatus(WaitlistStatus.WAITING);

        // Estimate wait based on parties already waiting
        long aheadInQueue = waitlistEntryRepository.countByStatusAndPartySize(WaitlistStatus.WAITING, request.partySize());
        entry.setEstimatedWaitMinutes((int) (aheadInQueue * AVG_TURN_MINS_PER_HEAD) + AVG_TURN_MINS_PER_HEAD);

        WaitlistEntry saved = waitlistEntryRepository.save(entry);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> getActiveWaitlist() {
        return waitlistEntryRepository.findByStatusOrderByCreatedAtAsc(WaitlistStatus.WAITING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WaitlistEntryResponse notifyGuest(UUID id, String performedBy) {
        WaitlistEntry entry = waitlistEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found."));

        if (entry.getPhoneNumber() == null || entry.getPhoneNumber().isBlank()) {
            throw new BusinessRuleException("Cannot notify guest without a phone number.");
        }

        if (entry.getStatus() != WaitlistStatus.WAITING) {
            throw new BusinessRuleException("Only waiting guests can be notified.");
        }

        entry.setStatus(WaitlistStatus.NOTIFIED);
        entry.setNotifiedAt(Instant.now());
        
        // TODO: In a real system, trigger SMS service here
        
        return mapToResponse(waitlistEntryRepository.save(entry));
    }

    @Override
    public void removeFromWaitlist(UUID id, String performedBy) {
         WaitlistEntry entry = waitlistEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found."));

         entry.setStatus(WaitlistStatus.CANCELLED);
         waitlistEntryRepository.save(entry);
    }

    private WaitlistEntryResponse mapToResponse(WaitlistEntry entry) {
        UUID tableId = null;
        String tableName = null;
        if (entry.getSeatedAtTable() != null) {
            tableId = entry.getSeatedAtTable().getId();
            tableName = entry.getSeatedAtTable().getName();
        }

        String handledBy = null;
        if (entry.getHandledBy() != null) {
             handledBy = entry.getHandledBy().getFullName();
        }

        return new WaitlistEntryResponse(
            entry.getId(),
            entry.getCustomerName(),
            entry.getPartySize(),
            entry.getPhoneNumber(),
            entry.getEstimatedWaitMinutes(),
            entry.getStatus().name(),
            entry.getNotifiedAt(),
            tableId,
            tableName,
            handledBy,
            entry.getCreatedAt()
        );
    }
}
