package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class VariantConfigDTO {
    private String key;
    private String name;
    private BigDecimal allocation;
    private boolean isControl;
    private Map<String, Object> config;
}
