package mls.sho.dms.application.service.floor;

import mls.sho.dms.application.dto.floor.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface WaitlistService {
    WaitlistEntryResponse addToWaitlist(CreateWaitlistEntryRequest request, String performedBy);
    List<WaitlistEntryResponse> getActiveWaitlist();
    WaitlistEntryResponse notifyGuest(UUID id, String performedBy);
    void removeFromWaitlist(UUID id, String performedBy);
}
