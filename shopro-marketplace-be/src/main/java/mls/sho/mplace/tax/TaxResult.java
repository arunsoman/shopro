package mls.sho.mplace.tax;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxResult {
    private BigDecimal outputVat;
    private BigDecimal inputVat;
    private BigDecimal whtAmount;
    private String     primaryRuleCode;
}
