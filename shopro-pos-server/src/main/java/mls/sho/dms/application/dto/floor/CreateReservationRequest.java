package mls.sho.dms.application.dto.floor;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateReservationRequest(
    @NotNull(message = "Table ID is required.")
    UUID tableId,

    @NotBlank(message = "Guest name is required.")
    @Size(max = 120, message = "Guest name must be 120 characters or fewer.")
    String guestName,

    @Min(value = 1, message = "Party size must be at least 1.")
    @Max(value = 50, message = "Party size cannot exceed 50.")
    int partySize,

    @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number format.")
    String guestPhone,

    @NotNull(message = "Reservation start time is required.")
    @Future(message = "Reservation start time must be in the future.")
    Instant reservationStart
) {}
