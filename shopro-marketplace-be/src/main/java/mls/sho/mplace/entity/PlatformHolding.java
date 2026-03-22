package mls.sho.mplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "platform_holding")
@Getter
@Setter
public class PlatformHolding extends BaseEntity {

    @Column(name = "account_name", unique = true, nullable = false)
    private String accountName;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String currency = "INR";
}
