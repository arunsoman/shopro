package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.JwtService;
import mls.sho.mplace.dto.AuthResponse;
import mls.sho.mplace.dto.LoginRequest;
import mls.sho.mplace.dto.RegistrationRequest;
import mls.sho.mplace.entity.MarketplaceBuyer;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.Restaurant;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.OperatorRepository;
import mls.sho.mplace.repository.RestaurantRepository;
import mls.sho.mplace.repository.SupplierRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final OperatorRepository operatorRepository;
    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierRepository;
    private final RestaurantRepository restaurantRepository;
    private final SupplierRepository supplierOrgRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        
        var user = (mls.sho.mplace.config.MarketplaceUser) userDetailsService.loadUserByUsername(request.email());
        
        String audience = "marketplace_operator";
        if (buyerRepository.findByEmail(request.email()).isPresent()) {
            audience = "marketplace_buyer";
        } else if (supplierRepository.findByEmail(request.email()).isPresent()) {
            audience = "marketplace_supplier";
        }
        
        var token = jwtService.generateToken(user, audience);
        return new AuthResponse(token, null);
    }

    @Transactional
    public void register(RegistrationRequest request) {
        if (request.portalType().equalsIgnoreCase("BUYER")) {
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.organizationName());
            restaurant = restaurantRepository.save(restaurant);

            MarketplaceBuyer buyer = new MarketplaceBuyer();
            buyer.setEmail(request.email());
            buyer.setPassword(passwordEncoder.encode(request.password()));
            buyer.setFullName(request.fullName());
            buyer.setRestaurantId(restaurant.getId());
            buyerRepository.save(buyer);
        } else if (request.portalType().equalsIgnoreCase("SUPPLIER")) {
            Supplier supplier = new Supplier();
            supplier.setName(request.organizationName());
            supplier.setVerificationStatus(Supplier.VerificationStatus.PENDING);
            Supplier savedSupplier = supplierOrgRepository.save(supplier);

            MarketplaceSupplier ms = new MarketplaceSupplier();
            ms.setEmail(request.email());
            ms.setPassword(passwordEncoder.encode(request.password()));
            ms.setFullName(request.fullName());
            ms.setSupplierId(savedSupplier.getId());
            supplierRepository.save(ms);
        }
    }
}
