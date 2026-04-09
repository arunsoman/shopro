package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.SubRecipeResponse;
import mls.sho.dms.application.service.inventory.SubRecipeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/sub-recipes")
@RequiredArgsConstructor
@Tag(name = "Inventory Sub-Recipes", description = "Prepared item management")
public class SubRecipeController {

    private final SubRecipeService subRecipeService;

    @GetMapping
    public List<SubRecipeResponse> findAll() {
        return subRecipeService.findAll();
    }

    @GetMapping("/{id}")
    public SubRecipeResponse findById(@PathVariable UUID id) {
        return subRecipeService.findById(id);
    }
}
