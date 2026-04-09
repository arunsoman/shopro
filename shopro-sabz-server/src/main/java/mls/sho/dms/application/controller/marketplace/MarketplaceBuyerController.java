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
@RequestMapping("/api/v1/marketplace/buyer")
@RequiredArgsConstructor
public class MarketplaceBuyerController {

    private final PurchaseOrderRepository poRepository;
    private final IdentityMaskingService maskingService;

    @GetMapping("/orders")
    public ResponseEntity<List<MarketplaceOrderDTO>> getBuyerOrders(@RequestAttribute("marketplace_principal") MarketplaceUserPrincipal principal) {
        // Find POs of type CUSTOMER_SALES that belong to this restaurant
        List<MarketplaceOrderDTO> orders = poRepository.findByPoType(POType.CUSTOMER_SALES).stream()
                .filter(o -> o.getRestaurantId() != null && o.getRestaurantId().equals(principal.getAssociatedEntityId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(orders);
    }

    private MarketplaceOrderDTO mapToDTO(PurchaseOrder po) {
        MarketplaceOrderDTO dto = new MarketplaceOrderDTO();
        dto.setId(po.getId().toString()); // In a real app, we might mask this too
        dto.setTotalValue(po.getTotalValue());
        dto.setStatus(po.getStatus().name());
        dto.setCreatedAt(po.getCreatedAt());
        
        // Mask the supplier identity
        if (po.getSupplier() != null) {
            String maskedSupplierId = maskingService.mask(po.getSupplier().getId(), MaskedIdentity.IdentityCategory.SELLER);
            dto.setSellerName("Verified Seller " + maskedSupplierId);
        } else {
            dto.setSellerName("Shopro Fulfilled");
        }
        
        return dto;
    }
}
