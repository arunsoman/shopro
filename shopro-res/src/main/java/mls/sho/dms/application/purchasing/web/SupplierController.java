package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.SupplierDTO;
import mls.sho.dms.application.purchasing.service.SupplierService;
import mls.sho.dms.application.purchasing.entity.Supplier;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for managing suppliers at the restaurant level.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping("/search")
    public List<SupplierDTO> searchSuppliers(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String q) {
        return supplierService.getSuppliers(restaurantId).stream()
                .map(supplierService::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping
    public List<SupplierDTO> getSuppliers(@PathVariable Long restaurantId) {
        return supplierService.getSuppliers(restaurantId).stream()
                .map(supplierService::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SupplierDTO getSupplier(@PathVariable Long restaurantId, @PathVariable Long id) {
        return supplierService.toDTO(supplierService.getSupplier(id));
    }

    @PostMapping
    public SupplierDTO createSupplier(@PathVariable Long restaurantId, @RequestBody Supplier supplier) {
        supplier.setRestaurant(new mls.sho.dms.entity.Restaurant());
        supplier.getRestaurant().setId(restaurantId);
        return supplierService.toDTO(supplierService.saveSupplier(supplier));
    }

    @PutMapping("/{id}")
    public SupplierDTO updateSupplier(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody Supplier supplier) {
        supplier.setId(id);
        supplier.setRestaurant(new mls.sho.dms.entity.Restaurant());
        supplier.getRestaurant().setId(restaurantId);
        return supplierService.toDTO(supplierService.saveSupplier(supplier));
    }

    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long restaurantId, @PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }
}
