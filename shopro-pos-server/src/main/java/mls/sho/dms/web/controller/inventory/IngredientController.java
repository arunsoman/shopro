package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.service.inventory.IngredientService;
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

    @GetMapping
    public List<IngredientResponse> findAll() {
        return ingredientService.findAll();
    }

    @GetMapping("/{id}")
    public IngredientResponse findById(@PathVariable UUID id) {
        return ingredientService.findById(id);
    }

    @GetMapping("/low-stock")
    public List<IngredientResponse> findLowStock() {
        return ingredientService.findLowStock();
    }
}
