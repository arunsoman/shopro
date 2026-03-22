package mls.sho.mplace.controller;

import mls.sho.mplace.dto.MasterCategoryDTO;
import mls.sho.mplace.entity.MasterCategory;
import mls.sho.mplace.service.MasterCategoryService;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/master-categories")
public class MasterCategoryController {

    private final MasterCategoryService masterCategoryService;
    private final SecurityUtils securityUtils;

    public MasterCategoryController(MasterCategoryService masterCategoryService, SecurityUtils securityUtils) {
        this.masterCategoryService = masterCategoryService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public List<MasterCategory> getAll() {
        return masterCategoryService.getAll();
    }

    @GetMapping("/top")
    public List<MasterCategoryDTO> getTopLevelCategories() { // Changed return type and method name
        return masterCategoryService.getTopLevelCategories();
    }

    @GetMapping("/{parentId}/sub")
    public List<MasterCategoryDTO> getSubCategories(@PathVariable UUID parentId) { // Changed return type and method name
        return masterCategoryService.getSubCategories(parentId);
    }

    @PostMapping("/sync")
    public void syncToRestaurant(@RequestBody SyncRequest request) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || requester.restaurantId() == null) {
            throw new RuntimeException("Logged in restaurant not found");
        }
        masterCategoryService.syncToRestaurant(requester.restaurantId(), request.masterCategoryIds());
    }

    public record SyncRequest(List<UUID> masterCategoryIds) {}
}
