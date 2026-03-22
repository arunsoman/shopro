package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Restaurant;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.RestaurantRepository;
import mls.sho.mplace.repository.SupplierRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final RestaurantRepository restaurantRepository;
    private final SupplierRepository supplierRepository;
    private final SecurityUtils securityUtils;

    public Object getMyProfile() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return null;

        if (requester.isBuyer() && requester.restaurantId() != null) {
            return restaurantRepository.findById(requester.restaurantId()).orElse(null);
        } else if (requester.isSupplier() && requester.supplierId() != null) {
            return supplierRepository.findById(requester.supplierId()).orElse(null);
        }
        return null;
    }

    public void updateProfile(Object profile) {
        // Logic to update restaurant or supplier profile based on requester
    }
}
