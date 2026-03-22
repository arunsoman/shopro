package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.service.FoodService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public Page<Food> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return foodService.getAll(pageable);
    }

    @GetMapping("/search")
    public Page<Food> search(
            @RequestParam("q") String query,
            @PageableDefault(size = 20) Pageable pageable) {
        return foodService.search(query, pageable);
    }
}
