package mls.sho.dms.application.costing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.dto.CostCardDTO;
import mls.sho.dms.application.costing.dto.CostingLineDTO;
import mls.sho.dms.application.costing.dto.MenuCostGroupDTO;
import mls.sho.dms.application.costing.dto.MenuItemDTO;
import mls.sho.dms.application.costing.service.MenuCostGroupService;
import mls.sho.dms.application.costing.service.MenuItemCostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing menu categories and items.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}")
@RequiredArgsConstructor
public class MenuController {

    private final MenuCostGroupService costGroupService;
    private final MenuItemCostService menuItemService;

    @GetMapping("/cost-groups")
    public List<MenuCostGroupDTO> getCostGroups(@PathVariable Long restaurantId) {
        return costGroupService.getCostGroups(restaurantId);
    }

    @PostMapping("/cost-groups")
    public MenuCostGroupDTO createCostGroup(@PathVariable Long restaurantId, @RequestBody MenuCostGroupDTO dto) {
        return costGroupService.createCostGroup(restaurantId, dto);
    }

    @DeleteMapping("/cost-groups/{id}")
    public void deleteCostGroup(@PathVariable Long restaurantId, @PathVariable Long id) {
        costGroupService.deleteCostGroup(id);
    }

    @GetMapping("/menu-items")
    public List<MenuItemDTO> getMenuItems(@PathVariable Long restaurantId) {
        return menuItemService.getMenuItems(restaurantId);
    }

    @GetMapping("/menu-items/{id}/cost-card")
    public CostCardDTO getCostCard(@PathVariable Long restaurantId, @PathVariable Long id) {
        return menuItemService.getCostCard(id);
    }

    @PutMapping("/menu-items/{id}")
    public MenuItemDTO updateMenuItem(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody MenuItemDTO dto) {
        return menuItemService.updateMenuItem(id, dto);
    }

    @PutMapping("/menu-items/{id}/costing-lines")
    public List<CostingLineDTO> updateCostingLines(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody List<CostingLineDTO> lines) {
        return menuItemService.updateCostingLines(id, lines);
    }

    @PostMapping("/menu-items")
    public ResponseEntity<MenuItemDTO> createMenuItem(
            @PathVariable Long restaurantId,
            @RequestBody MenuItemDTO dto) {
        return ResponseEntity.status(201).body(menuItemService.createMenuItem(restaurantId, dto));
    }

    @DeleteMapping("/menu-items/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

}
