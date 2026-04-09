package mls.sho.dms.application.dto.finance;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record JournalEntryResponse(
    UUID id,
    Instant entryDate,
    String description,
    UUID referenceId,
    List<JournalLineResponse> lines
) {}
