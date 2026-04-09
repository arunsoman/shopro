package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreateSupplierRequest;
import mls.sho.dms.application.dto.inventory.PriceComparisonResponse;
import mls.sho.dms.application.dto.inventory.SupplierCatalogImportRequest;
import mls.sho.dms.application.dto.inventory.SupplierResponse;

import java.util.List;
import java.util.UUID;

public interface SupplierService {
    SupplierResponse create(CreateSupplierRequest request);
    SupplierResponse findById(UUID id);
    List<SupplierResponse> findAll();
    
    void importCatalog(UUID supplierId, SupplierCatalogImportRequest request);
    PriceComparisonResponse getPriceComparison(UUID ingredientId);
}
