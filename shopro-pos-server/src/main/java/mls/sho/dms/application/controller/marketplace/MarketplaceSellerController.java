package mls.sho.dms.application.controller.marketplace;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.security.MarketplaceUserPrincipal;
import mls.sho.dms.application.service.marketplace.IdentityMaskingService;
import mls.sho.dms.entity.inventory.POType;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.marketplace.MaskedIdentity;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/marketplace/seller")
@RequiredArgsConstructor
public class MarketplaceSellerController {

    private final PurchaseOrderRepository poRepository;
    private final IdentityMaskingService maskingService;

    @GetMapping("/orders")
    public ResponseEntity<List<MarketplaceOrderDTO>> getMyOrders(@RequestAttribute("marketplace_principal") MarketplaceUserPrincipal principal) {
        // Sellers see INTERNAL_PROCUREMENT POs sent to them by Shopro
        List<PurchaseOrder> orders = poRepository.findByPoType(POType.INTERNAL_PROCUREMENT);
        
        List<MarketplaceOrderDTO> dtos = orders.stream()
                .filter(o -> o.getSupplier() != null && o.getSupplier().getId().equals(principal.getAssociatedEntityId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    private MarketplaceOrderDTO mapToDTO(PurchaseOrder po) {
        MarketplaceOrderDTO dto = new MarketplaceOrderDTO();
        dto.setId(po.getId().toString());
        dto.setTotalValue(po.getTotalValue());
        dto.setStatus(po.getStatus().name());
        dto.setCreatedAt(po.getCreatedAt());
        
        // Mask the buyer identity (The parent CPO's restaurant)
        if (po.getRelatedPoId() != null) {
            String maskedBuyerId = maskingService.mask(po.getRelatedPoId(), MaskedIdentity.IdentityCategory.BUYER);
            dto.setBuyerName("Verified Restaurant " + maskedBuyerId);
        } else {
            dto.setBuyerName("Shopro Internal");
        }
        
        return dto;
    }
}
