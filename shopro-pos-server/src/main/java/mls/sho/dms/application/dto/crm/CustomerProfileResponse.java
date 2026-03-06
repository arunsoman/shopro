package mls.sho.dms.application.dto.crm;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerProfileResponse {
    UUID id;
    String firstName;
    String lastName;
    String phoneNumber;
    String email;
    String tierName;
    BigDecimal pointMultiplier;
    BigDecimal lifetimeSpend;
    int availablePoints;
    String preferenceNotes;
}
