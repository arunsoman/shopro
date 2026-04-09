package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.service.MenuItemConfigService;
import mls.sho.dms.entity.MenuItem;
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

    @PostMapping("/{menuItemId}/linkage")
    public MenuItem updateLinkage(
            @PathVariable Long restaurantId,
            @PathVariable Long menuItemId,
            @RequestBody List<mls.sho.dms.entity.RecipeIngredientLine> lines) {
        
        // In a full implementation, we would verify the restaurantId matches the MenuItem
        return configService.updatePrecisionLinkage(menuItemId, lines);
    }
}
