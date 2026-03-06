package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateSupplierRequest;
import mls.sho.dms.application.dto.inventory.PriceComparisonResponse;
import mls.sho.dms.application.dto.inventory.SupplierCatalogImportRequest;
import mls.sho.dms.application.dto.inventory.SupplierResponse;
import mls.sho.dms.application.service.inventory.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponse> create(@RequestBody CreateSupplierRequest request) {
        return ResponseEntity.ok(supplierService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> findAll() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    @PostMapping("/{id}/catalog")
    public ResponseEntity<Void> importCatalog(
            @PathVariable UUID id,
            @RequestBody SupplierCatalogImportRequest request) {
        supplierService.importCatalog(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/benchmarking/{ingredientId}")
    public ResponseEntity<PriceComparisonResponse> getPriceComparison(
            @PathVariable UUID ingredientId) {
        return ResponseEntity.ok(supplierService.getPriceComparison(ingredientId));
    }
}
