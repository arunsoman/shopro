package mls.sho.mplace.config;

import mls.sho.mplace.entity.MarketplaceBuyer;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.Operator;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.OperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Collections;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@EnableJpaAuditing
public class ApplicationConfig {

    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierRepository;
    private final OperatorRepository operatorRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // Try Operator first
            Optional<Operator> operator = operatorRepository.findByEmail(username);
            if (operator.isPresent()) {
                var op = operator.get();
                return MarketplaceUser.builder()
                        .id(op.getId())
                        .email(op.getEmail())
                        .password(op.getPassword())
                        .role(op.getRole().name())
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + op.getRole().name())))
                        .build();
            }

            // Try Buyer
            Optional<MarketplaceBuyer> buyer = buyerRepository.findByEmail(username);
            if (buyer.isPresent()) {
                var b = buyer.get();
                return MarketplaceUser.builder()
                        .id(b.getId())
                        .email(b.getEmail())
                        .password(b.getPassword())
                        .role("BUYER")
                        .restaurantId(b.getRestaurantId())
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_BUYER")))
                        .build();
            }

            // Try Supplier
            Optional<MarketplaceSupplier> supplier = supplierRepository.findByEmail(username);
            if (supplier.isPresent()) {
                var s = supplier.get();
                return MarketplaceUser.builder()
                        .id(s.getId())
                        .email(s.getEmail())
                        .password(s.getPassword())
                        .role("SUPPLIER")
                        .supplierId(s.getSupplierId())
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_SUPPLIER")))
                        .build();
            }

            throw new UsernameNotFoundException("User not found: " + username);
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
