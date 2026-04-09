package mls.sho.dms.application.controller.marketplace;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.security.MarketplaceUserPrincipal;
import mls.sho.dms.application.service.marketplace.IdentityMaskingService;
import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RfqStatus;
import mls.sho.dms.entity.marketplace.MaskedIdentity;
import mls.sho.dms.repository.inventory.RFQRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/marketplace/rfq")
@RequiredArgsConstructor
public class MarketplaceRFQController {

    private final RFQRepository rfqRepository;
    private final IdentityMaskingService maskingService;

    @GetMapping("/active")
    public ResponseEntity<List<MarketplaceRFQDTO>> getActiveRFQs(@RequestAttribute("marketplace_principal") MarketplaceUserPrincipal principal) {
        // Suppliers see all OPEN RFQs (but masked)
        List<RFQ> rfqs = rfqRepository.findByStatus(RfqStatus.OPEN);
        
        List<MarketplaceRFQDTO> dtos = rfqs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    private MarketplaceRFQDTO mapToDTO(RFQ rfq) {
        MarketplaceRFQDTO dto = new MarketplaceRFQDTO();
        dto.setId(rfq.getId().toString());
        dto.setIngredientName(rfq.getIngredient().getName());
        dto.setRequiredQty(rfq.getRequiredQty());
        dto.setDesiredDeliveryDate(rfq.getDesiredDeliveryDate());
        dto.setBidDeadline(rfq.getBidDeadline());
        
        // Mask the restaurant identity
        if (rfq.getRestaurantId() != null) {
            String maskedBuyerId = maskingService.mask(rfq.getRestaurantId(), MaskedIdentity.IdentityCategory.BUYER);
            dto.setBuyerName("Verified Restaurant " + maskedBuyerId);
        } else {
            dto.setBuyerName("Shopro Internal");
        }
        
        return dto;
    }
}
