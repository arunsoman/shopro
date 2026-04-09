package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import mls.sho.dms.common.enums.VariantStatus;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
public class VariantDTO {
    private UUID id;
    private String variantKey;
    private String name;
    private BigDecimal allocation;
    private Map<String, Object> config;
    private boolean isControl;
    private VariantStatus status;
}
