package mls.sho.dms.entity.experiment.config;

import lombok.Data;

@Data
public class RandomizationConfig {
    private String method;
    private int strata;
    private boolean autoBalance;
}
