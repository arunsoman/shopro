package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.UpdateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.service.inventory.IngredientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ingredients")
@RequiredArgsConstructor
@Tag(name = "Inventory Ingredients", description = "Raw material management")
public class IngredientController {

    private final IngredientService ingredientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IngredientResponse create(@Valid @RequestBody CreateIngredientRequest request) {
        return ingredientService.create(request);
    }

    @PatchMapping("/{id}")
    public IngredientResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateIngredientRequest request) {
        return ingredientService.update(id, request);
    }

    @GetMapping
    public Page<IngredientResponse> findAll(Pageable pageable) {
        return ingredientService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public IngredientResponse findById(@PathVariable UUID id) {
        return ingredientService.findById(id);
    }

    @GetMapping("/low-stock")
    public List<IngredientResponse> findLowStock() {
        return ingredientService.findLowStock();
    }

    @GetMapping("/daily-perishables")
    public List<IngredientResponse> findDailyPerishables() {
        return ingredientService.findDailyPerishables();
    }
}
