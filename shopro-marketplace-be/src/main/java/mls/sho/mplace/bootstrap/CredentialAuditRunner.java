package mls.sho.mplace.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.OperatorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

//@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class CredentialAuditRunner implements CommandLineRunner {

    private final OperatorRepository operatorRepository;
    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository supplierUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting verbose credential audit and reset...");
        String targetPass = "password";
        String newHash = passwordEncoder.encode(targetPass);

        operatorRepository.findAll().forEach(o -> {
            o.setPassword(newHash);
            operatorRepository.save(o);
            log.info("Reset operator: {} -> hash starts with {}", o.getEmail(), newHash.substring(0, 10));
        });

        buyerRepository.findAll().forEach(b -> {
            b.setPassword(newHash);
            buyerRepository.save(b);
            log.info("Reset buyer: {} -> hash starts with {}", b.getEmail(), newHash.substring(0, 10));
        });

        supplierUserRepository.findAll().forEach(s -> {
            s.setPassword(newHash);
            supplierUserRepository.save(s);
            log.info("Reset supplier user: {} -> hash starts with {}", s.getEmail(), newHash.substring(0, 10));
        });

        log.info("Credential audit and reset complete.");
    }
}
