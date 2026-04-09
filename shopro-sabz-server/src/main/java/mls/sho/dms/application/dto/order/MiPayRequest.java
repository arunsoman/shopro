package mls.sho.dms.application.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MiPayRequest(
    @NotNull UUID orderId,
    @NotBlank String phoneNumber
) {}
