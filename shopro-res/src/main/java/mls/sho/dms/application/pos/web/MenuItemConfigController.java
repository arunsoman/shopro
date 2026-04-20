package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.entity.RecipeIngredientLine;
import mls.sho.dms.application.pos.service.MenuItemConfigService;
import mls.sho.dms.application.pos.entity.MenuItem;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for deep-configuring Menu Item recipes.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu-config")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuItemConfigController {

    private final MenuItemConfigService configService;
    private final mls.sho.dms.application.common.TenantGuard tenantGuard;

    @PostMapping("/{menuItemId}/linkage")
    public MenuItem updateLinkage(
            @PathVariable Long restaurantId,
            @PathVariable Long menuItemId,
            @RequestBody List<RecipeIngredientLine> lines) {
        
        tenantGuard.menuItem(restaurantId, menuItemId);
        return configService.updatePrecisionLinkage(menuItemId, lines);
    }
}
