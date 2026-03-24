package mls.sho.mplace.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BidInvitationDto(
    UUID id,
    String title,
    String description,
    String categoryName,
    LocalDateTime deadline,
    String status,
    String urgency,
    String operationMode,
    String repeatFrequency,
    LocalDateTime nextRunDate,
    List<BidItemDto> items
) {}
