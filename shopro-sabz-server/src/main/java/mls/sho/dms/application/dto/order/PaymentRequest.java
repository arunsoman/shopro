package mls.sho.dms.application.dto.order;

import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.order.PaymentMethod;
import java.util.UUID;

public record PaymentRequest(
    @NotNull java.util.UUID orderId,
    @NotNull mls.sho.dms.entity.order.PaymentMethod method,
    @NotNull java.math.BigDecimal amount
) {}
