package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.InviteSupplierUserRequest;
import mls.sho.dms.application.dto.inventory.SupplierUserResponse;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.SupplierUserService;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.entity.inventory.SupplierUser;
import mls.sho.dms.repository.inventory.SupplierRepository;
import mls.sho.dms.repository.inventory.SupplierUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierUserServiceImpl implements SupplierUserService {

    private final SupplierUserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AlertService alertService;

    @Override
    @Transactional
    public SupplierUserResponse inviteUser(UUID supplierId, InviteSupplierUserRequest request) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        SupplierUser user = new SupplierUser();
        user.setSupplier(supplier);
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setRole(request.role());
        
        // Default password for initial invitation (in a real app, this would be a temporary token)
        // Using "password" as the default for now to match our test pattern
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.setActive(true);

        SupplierUser saved = userRepository.save(user);

        // Send simulated notification
        String message = String.format("Hello %s, you've been invited to the Shopro Supplier Portal for %s. Login with your email. Default password: password", 
                user.getFullName(), supplier.getCompanyName());
        
        alertService.sendNotification(user.getEmail(), "Invited to Shopro Supplier Portal", message);
        if (user.getPhoneNumber() != null) {
            log.info("Simulating SMS to {}: {}", user.getPhoneNumber(), message);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierUserResponse> getSupplierUsers(UUID supplierId) {
        return userRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deactivateUser(UUID userId) {
        SupplierUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    private SupplierUserResponse mapToResponse(SupplierUser user) {
        return new SupplierUserResponse(
            user.getId(),
            user.getSupplier().getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getRole(),
            user.isActive()
        );
    }
}
