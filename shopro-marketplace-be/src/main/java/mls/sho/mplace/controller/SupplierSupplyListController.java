package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.entity.SupplyList;
import mls.sho.mplace.service.SupplyListService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/supplier/supply-list")
@RequiredArgsConstructor
public class SupplierSupplyListController {

    private final SupplyListService supplyListService;

    @GetMapping
    public List<SupplyList> getSupplyList(@AuthenticationPrincipal MarketplaceUser user) {
        return supplyListService.getSupplyListBySupplier(user.getSupplierId());
    }

    @PostMapping("/add")
    public SupplyList addFoodToSupplyList(@AuthenticationPrincipal MarketplaceUser user, @RequestBody Integer foodId) {
        return supplyListService.addFoodToSupplyList(user.getSupplierId(), foodId);
    }

    @DeleteMapping("/{foodId}")
    public void removeFromSupplyList(@AuthenticationPrincipal MarketplaceUser user, @PathVariable Integer foodId) {
        supplyListService.removeFromSupplyList(user.getSupplierId(), foodId);
    }

    @PatchMapping("/{foodId}")
    public SupplyList updateSupplyListItem(@AuthenticationPrincipal MarketplaceUser user, @PathVariable Integer foodId, @RequestBody SupplyList updateRequest) {
        return supplyListService.updateSupplyListItem(user.getSupplierId(), foodId, updateRequest);
    }
}
