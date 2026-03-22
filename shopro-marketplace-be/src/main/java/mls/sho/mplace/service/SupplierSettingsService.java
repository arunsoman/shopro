package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.SupplierRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierSettingsService {

    private final SupplierRepository supplierRepository;
    private final SecurityUtils securityUtils;

    public Map<String, Object> getSettings(UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        return Map.of(
            "payoutDetails", Map.of(
                "bank", "HDFC Bank", // Extract from supplier entity if added
                "account", "********8821",
                "ifsc", "HDFC0001234"
            ),
            "notifications", Map.of("email", true, "whatsapp", true, "sms", false),
            "securityHold", Map.of("active", false, "expiry", "N/A")
        );
    }

    @Transactional
    public void updatePayout(UUID supplierId, Map<String, String> details) {
        // Implementation for 24h hold logic
    }
}
