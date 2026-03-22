package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.service.SupplierLogisticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Supplier Logistics Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/logistics")
@RequiredArgsConstructor
public class SupplierLogisticsController {

    private final SupplierLogisticsService logisticsService;

    @GetMapping("/active")
    public List<SupplierLogisticsService.DeliveryTracking> getActiveDeliveries(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return logisticsService.getActiveDeliveries(supplier);
    }

    @GetMapping("/vehicles")
    public List<Map<String, String>> getVehicles(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return logisticsService.getVehicles(supplier);
    }
}
