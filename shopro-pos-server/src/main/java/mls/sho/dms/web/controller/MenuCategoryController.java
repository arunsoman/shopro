package mls.sho.dms.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.menu.CreateMenuCategoryRequest;
import mls.sho.dms.application.dto.menu.MenuCategoryResponse;
import mls.sho.dms.application.dto.menu.ReorderCategoriesRequest;
import mls.sho.dms.application.service.MenuCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu-categories")
@RequiredArgsConstructor
@Tag(name = "Menu Categories", description = "Endpoints for managing menu categories")
public class MenuCategoryController {

    private final MenuCategoryService service;

    @GetMapping
    @Operation(summary = "List all categories", description = "Returns all categories ordered by displayOrder")
    public List<MenuCategoryResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public MenuCategoryResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuCategoryResponse create(@Valid @RequestBody CreateMenuCategoryRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MenuCategoryResponse update(@PathVariable UUID id, @Valid @RequestBody CreateMenuCategoryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PostMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorder(@Valid @RequestBody ReorderCategoriesRequest request) {
        service.reorder(request);
    }
}
