package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.repository.SupplierRepository;
import mls.sho.dms.application.purchasing.dto.SupplierDTO;
import mls.sho.dms.application.purchasing.entity.Supplier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    public SupplierDTO toDTO(Supplier entity) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setContactName(entity.getContactName());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }


    private final SupplierRepository repository;

    @Transactional(readOnly = true)
    public List<Supplier> getSuppliers(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId);
    }

    @Transactional
    public Supplier saveSupplier(Supplier supplier) {
        return repository.save(supplier);
    }

    @Transactional(readOnly = true)
    public Supplier getSupplier(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        repository.deleteById(id);
    }
}
