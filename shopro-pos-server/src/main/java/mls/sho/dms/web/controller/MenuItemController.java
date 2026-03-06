package mls.sho.dms.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.DuplicateCheckResponse;
import mls.sho.dms.application.dto.menu.CreateMenuItemRequest;
import mls.sho.dms.application.dto.menu.MenuItemResponse;
import mls.sho.dms.application.dto.menu.UpdateMenuItemRequest;
import mls.sho.dms.application.service.MenuItemService;
import mls.sho.dms.entity.menu.MenuItemStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Items", description = "CRUD and lifecycle management for menu items")
public class MenuItemController {

    private final MenuItemService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse create(@Valid @RequestBody CreateMenuItemRequest request) {
        // Normally extract username from SecurityContextHolder
        String performedBy = "Manager";
        return service.create(request, performedBy);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateMenuItemRequest request) {
        String performedBy = "Manager";
        return service.update(id, request, performedBy);
    }

    @GetMapping("/{id}")
    public MenuItemResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping
    @Operation(summary = "List items by criteria", description = "Fetch items filtered by category and status")
    public List<MenuItemResponse> findByCriteria(
            @RequestParam UUID categoryId,
            @RequestParam MenuItemStatus status) {
        return service.findByCriteria(categoryId, status);
    }

    @GetMapping("/published")
    @Operation(summary = "List published items", description = "Used by Server POS Grid to fetch active items")
    public List<MenuItemResponse> findAllPublished() {
        return service.findAllPublished();
    }

    @GetMapping("/drafts")
    @Operation(summary = "List draft items", description = "Used by Manager app")
    public List<MenuItemResponse> findAllDrafts() {
        return service.findAllDrafts();
    }

    @GetMapping("/duplicate-check")
    public DuplicateCheckResponse checkDuplicate(
            @RequestParam String name,
            @RequestParam UUID categoryId) {
        return service.checkDuplicate(name, categoryId);
    }

    @PutMapping("/{id}/status")
    public MenuItemResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam MenuItemStatus status) {
        String performedBy = "Manager";
        return service.updateStatus(id, status, performedBy);
    }

    @PostMapping(value = "/{id}/photo", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public String uploadPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        String performedBy = "Manager";
        return service.uploadPhoto(id, file, performedBy);
    }
}
