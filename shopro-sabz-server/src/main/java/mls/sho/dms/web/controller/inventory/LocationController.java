package mls.sho.dms.web.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.inventory.InventoryLocation;
import mls.sho.dms.repository.inventory.InventoryLocationRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/locations")
@RequiredArgsConstructor
public class LocationController {

    private final InventoryLocationRepository locationRepository;

    @GetMapping
    public List<InventoryLocation> getAll() {
        return locationRepository.findAll();
    }

    @PostMapping
    public InventoryLocation create(@RequestBody InventoryLocation location) {
        if (locationRepository.existsByNameIgnoreCase(location.getName())) {
            throw new IllegalArgumentException("Location already exists: " + location.getName());
        }
        return locationRepository.save(location);
    }
}
