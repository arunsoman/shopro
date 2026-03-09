package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CreatePromoCodeRequest;
import mls.sho.dms.application.dto.crm.PromoCodeResponse;
import mls.sho.dms.application.dto.crm.ValidatePromoResponse;
import mls.sho.dms.application.service.crm.PromoCodeService;
import mls.sho.dms.application.service.crm.SegmentService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.CustomerSegment;
import mls.sho.dms.entity.crm.PromoCode;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.CustomerSegmentRepository;
import mls.sho.dms.repository.crm.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromoCodeServiceImpl implements PromoCodeService {

    private final PromoCodeRepository promoRepository;
    private final CustomerSegmentRepository segmentRepository;
    private final CustomerProfileRepository customerRepository;
    private final SegmentService segmentService;

    @Override
    @Transactional
    public PromoCodeResponse createPromoCode(CreatePromoCodeRequest request) {
        if (promoRepository.findByCodeIgnoreCase(request.code()).isPresent()) {
            throw new IllegalArgumentException("Promo code already exists");
        }

        CustomerSegment segment = null;
        if (request.segmentId() != null) {
            segment = segmentRepository.findById(request.segmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Segment not found"));
        }

        PromoCode promoCode = PromoCode.builder()
                .code(request.code().toUpperCase())
                .description(request.description())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .maxUses(request.maxUses())
                .validFrom(request.validFrom())
                .validUntil(request.validUntil())
                .isActive(true)
                .segment(segment)
                .build();

        PromoCode saved = promoRepository.save(promoCode);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PromoCodeResponse getPromoCode(UUID id) {
        return promoRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Promo code not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromoCodeResponse> getAllPromoCodes() {
        return promoRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePromoCode(UUID id) {
        promoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ValidatePromoResponse validateCodeForCustomer(String code, UUID customerId) {
        PromoCode promo = promoRepository.findByCodeIgnoreCase(code)
                .orElse(null);

        if (promo == null || !promo.isActive()) {
            return new ValidatePromoResponse(false, "Invalid or inactive promo code", null, null);
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (promo.getValidFrom() != null && now.isBefore(promo.getValidFrom())) {
            return new ValidatePromoResponse(false, "Promo code is not yet valid", null, null);
        }
        if (promo.getValidUntil() != null && now.isAfter(promo.getValidUntil())) {
            return new ValidatePromoResponse(false, "Promo code has expired", null, null);
        }

        if (promo.getMaxUses() != null && promo.getCurrentUses() >= promo.getMaxUses()) {
            return new ValidatePromoResponse(false, "Promo code usage limit reached", null, null);
        }

        if (promo.getSegment() != null) {
            CustomerProfile customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
            
            boolean inSegment = segmentService.evaluateCustomerInSegment(customer, promo.getSegment().getId());
            if (!inSegment) {
                return new ValidatePromoResponse(false, "Promo code is not applicable for this customer segment", null, null);
            }
        }

        return new ValidatePromoResponse(
                true,
                "Valid promo code",
                promo.getDiscountType(),
                promo.getDiscountValue()
        );
    }

    private PromoCodeResponse mapToResponse(PromoCode promo) {
        return new PromoCodeResponse(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountType(),
                promo.getDiscountValue(),
                promo.getMaxUses(),
                promo.getCurrentUses(),
                promo.getValidFrom(),
                promo.getValidUntil(),
                promo.isActive(),
                promo.getSegment() != null ? promo.getSegment().getId() : null
        );
    }
}
