package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.CreatePromoCodeRequest;
import mls.sho.dms.application.dto.crm.PromoCodeResponse;
import mls.sho.dms.application.dto.crm.ValidatePromoResponse;

import java.util.List;
import java.util.UUID;

public interface PromoCodeService {
    PromoCodeResponse createPromoCode(CreatePromoCodeRequest request);
    PromoCodeResponse getPromoCode(UUID id);
    List<PromoCodeResponse> getAllPromoCodes();
    ValidatePromoResponse validateCodeForCustomer(String code, UUID customerId);
    void deletePromoCode(UUID id);
}
