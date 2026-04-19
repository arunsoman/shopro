package mls.sho.dms.application.primecost.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.primecost.dto.PrimeCostDtos.LivePrimeCostDto;
import mls.sho.dms.application.primecost.service.PrimeCostService;
import mls.sho.dms.entity.Restaurant;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Provides prime cost data aggregated across multiple restaurant locations.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/prime-cost/multi-location")
@RequiredArgsConstructor
public class MultiLocationPrimeCostController {

    private final PrimeCostService primeCostService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public Map<String, Object> getMultiLocationPrimeCost(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam(required = false) List<Long> restaurantIds) {

        List<Restaurant> restaurants = (restaurantIds != null && !restaurantIds.isEmpty())
                ? restaurantRepository.findAllById(restaurantIds)
                : restaurantRepository.findAll();

        LocalDate effectiveWeekStart = weekStart != null ? weekStart
                : LocalDate.now().with(java.time.DayOfWeek.MONDAY);

        List<LivePrimeCostDto> locations = restaurants.stream()
                .map(r -> primeCostService.getLivePrimeCost(r.getId()))
                .collect(Collectors.toList());

        return Map.of("locations", locations);
    }
}
