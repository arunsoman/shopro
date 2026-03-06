package mls.sho.dms.application.mapper;

import mls.sho.dms.application.dto.crm.CreateCustomerRequest;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.entity.crm.CustomerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerMapper {

    @Mapping(target = "loyaltyTier", ignore = true)
    CustomerProfile toEntity(CreateCustomerRequest request);

    @Mapping(target = "tierName", source = "loyaltyTier.name")
    @Mapping(target = "pointMultiplier", source = "loyaltyTier.pointMultiplier")
    CustomerProfileResponse toResponse(CustomerProfile entity);
}
