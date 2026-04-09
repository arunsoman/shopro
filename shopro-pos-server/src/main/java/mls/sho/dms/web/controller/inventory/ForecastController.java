package mls.sho.dms.web.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.inventory.ingredient.DemandForecast;
import mls.sho.dms.repository.inventory.DemandForecastRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/forecasts")
@RequiredArgsConstructor
public class ForecastController {

    private final DemandForecastRepository forecastRepository;

    @GetMapping("/ingredient/{ingredientId}")
    public List<DemandForecast> getByIngredient(
            @PathVariable UUID ingredientId,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end) {
        
        if (start == null) start = LocalDate.now();
        if (end == null) end = start.plusDays(7);
        
        return forecastRepository.findAllByIngredientIdAndForecastDateBetween(ingredientId, start, end);
    }
}
