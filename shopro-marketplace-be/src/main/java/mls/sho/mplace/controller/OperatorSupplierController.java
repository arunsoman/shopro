package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.SupplierManagementDto;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.SupplierRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import mls.sho.mplace.service.UserManagementService;

@RestController
@RequestMapping("/api/operator/suppliers")
@RequiredArgsConstructor
public class OperatorSupplierController {

    private final UserManagementService userManagementService;
    private final SupplierRepository supplierRepository; // For mapToDto reuse or move to service

    @GetMapping
    public List<SupplierManagementDto> getSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable UUID id, @RequestParam String status) {
        userManagementService.updateSupplierStatus(id, status);
    }

    private SupplierManagementDto mapToDto(Supplier s) {
        return new SupplierManagementDto(
                s.getId(),
                s.getName(),
                s.getCategory() != null ? s.getCategory() : "OTHERS",
                s.getVolume(),
                s.getVerificationStatus().name(),
                s.getTrustScore(),
                s.getFulfillmentRate(),
                s.getImageUrl()
        );
    }
}
