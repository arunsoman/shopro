package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.BuyerDto;
import mls.sho.mplace.dto.SupplierDto;
import mls.sho.mplace.entity.MarketplaceBuyer;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.Restaurant;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.RestaurantRepository;
import mls.sho.mplace.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierRepository;
    private final RestaurantRepository restaurantRepository;
    private final SupplierRepository supplierOrgRepository;

    public List<BuyerDto> getAllBuyers() {
        return buyerRepository.findAll().stream().map(buyer -> {
            String restaurantName = "Unknown";
            if (buyer.getRestaurantId() != null) {
                restaurantName = restaurantRepository.findById(buyer.getRestaurantId())
                        .map(Restaurant::getName).orElse("Unknown");
            }
            return new BuyerDto(
                    buyer.getId(),
                    buyer.getEmail(),
                    buyer.getFullName(),
                    restaurantName,
                    buyer.isEnabled() ? "Active" : "Suspended"
            );
        }).toList();
    }

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(ms -> {
            String supplierName = "Unknown";
            String verification = "N/A";
            if (ms.getSupplierId() != null) {
                Optional<Supplier> org = supplierOrgRepository.findById(ms.getSupplierId());
                supplierName = org.map(Supplier::getName).orElse("Unknown");
                verification = org.map(s -> s.getVerificationStatus().name()).orElse("N/A");
            }
            return new SupplierDto(
                    ms.getId(),
                    ms.getEmail(),
                    ms.getFullName(),
                    supplierName,
                    verification
            );
        }).toList();
    }

    @Transactional
    public void verifySupplier(UUID supplierId) {
        supplierOrgRepository.findById(supplierId).ifPresent(s -> {
            s.setVerificationStatus(Supplier.VerificationStatus.VERIFIED);
            supplierOrgRepository.save(s);
        });
    }

    @Transactional
    public void rejectSupplier(UUID supplierId) {
        supplierOrgRepository.findById(supplierId).ifPresent(s -> {
            s.setVerificationStatus(Supplier.VerificationStatus.REJECTED);
            supplierOrgRepository.save(s);
        });
    }

    @Transactional
    public void updateSupplierStatus(UUID supplierId, String status) {
        supplierOrgRepository.findById(supplierId).ifPresent(s -> {
            s.setVerificationStatus(Supplier.VerificationStatus.valueOf(status));
            supplierOrgRepository.save(s);
        });
    }

    @Transactional
    public void updateRestaurantStatus(UUID restaurantId, String status) {
        restaurantRepository.findById(restaurantId).ifPresent(r -> {
            r.setVerificationStatus(Restaurant.VerificationStatus.valueOf(status));
            restaurantRepository.save(r);
        });
    }
}
