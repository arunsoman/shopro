package mls.sho.mplace.util;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceBuyer;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.Operator;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.OperatorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierRepository;
    private final OperatorRepository operatorRepository;

    public RequesterInfo getCurrentRequester() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();

        var buyer = buyerRepository.findByEmail(email);
        if (buyer.isPresent()) {
            return new RequesterInfo(buyer.get().getId(), buyer.get().getRestaurantId(), null, "BUYER", email);
        }

        var supplier = supplierRepository.findByEmail(email);
        if (supplier.isPresent()) {
            return new RequesterInfo(supplier.get().getId(), null, supplier.get().getSupplierId(), "SUPPLIER", email);
        }

        var operator = operatorRepository.findByEmail(email);
        if (operator.isPresent()) {
            return new RequesterInfo(operator.get().getId(), null, null, operator.get().getRole().name(), email);
        }

        return null;
    }

    public record RequesterInfo(UUID userId, UUID restaurantId, UUID supplierId, String role, String email) {
        public boolean isBuyer() { return "BUYER".equals(role); }
        public boolean isSupplier() { return "SUPPLIER".equals(role); }
        public boolean isOperator() { return !isBuyer() && !isSupplier(); }
    }
}
