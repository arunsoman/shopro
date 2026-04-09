package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.users.repo.ShoProUserRepository;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.application.users.service.PinEncoder;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.ShoProUser;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@Order(1) // Run early to ensure root user and basic data exist
@RequiredArgsConstructor
@Slf4j
public class ShoProUserSeeder implements CommandLineRunner {

    private final ShoProUserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final PinEncoder pinEncoder;

    @Override
    public void run(String... args) throws Exception {
        syncRootUser();
        seedRestaurantAndStaff();
    }

    private void syncRootUser() {
        String rootEmail = "root@shopro.internal";
        String rootUsername = "root@shopro.internal";

        ShoProUser rootUser = userRepository.findByEmail(rootEmail)
            .orElseGet(() -> ShoProUser.builder()
                .email(rootEmail)
                .build());

        log.info("{} ShoPro root user: {}", 
            rootUser.getShoproId() == null ? "Seeding" : "Updating", 
            rootUsername);

        rootUser.setUsername(rootUsername);
        rootUser.setFullName("System Administrator");
        rootUser.setPasswordHash(passwordEncoder.encode("password"));
        rootUser.setIsActive(true);
        rootUser.setIsSuperAdmin(true);
        rootUser.setMfaEnabled(false);
        rootUser.setRequirePasswordChange(false);
        rootUser.setPermissions(Arrays.asList("ROLE_ADMIN", "ROLE_SHOPRO"));
        rootUser.setPasswordChangedAt(LocalDateTime.now());

        userRepository.save(rootUser);
        log.info("Root user synchronized successfully: {} / password", rootUsername);
    }

    private void seedRestaurantAndStaff() {
        // 1. Ensure a default Restaurant exists
        Restaurant restaurant = restaurantRepository.findAll().stream().findFirst()
            .orElseGet(() -> {
                log.info("Seeding default restaurant: The Gourmet Kitchen");
                Restaurant r = new Restaurant();
                r.setName("The Gourmet Kitchen");
                r.setTimezone("America/New_York");
                return restaurantRepository.save(r);
            });

        // 2. Ensure an administrative Staff user exists for this restaurant
        String staffName = "John Chef";
        
        // Find if this staff admin already exists (rudimentary check by name and restaurant)
        Staff staff = staffRepository.findByRestaurantIdAndIsActiveTrue(restaurant.getId()).stream()
            .filter(s -> s.getDisplayName().equals(staffName))
            .findFirst()
            .orElseGet(() -> Staff.builder()
                .restaurantId(restaurant.getId())
                .displayName(staffName)
                .build());

        log.info("{} staff admin: {} for restaurant ID: {}", 
            staff.getStaffId() == null ? "Seeding" : "Updating", 
            staffName, 
            restaurant.getId());

        staff.setRole(StaffRole.MANAGER);
        staff.setPinHash(pinEncoder.encode("1234")); // Admin PIN
        staff.setPinLength(4);
        staff.setIsActive(true);
        
        // Enable broad administrative permissions
        staff.setCanTakeOrders(true);
        staff.setCanProcessPayments(true);
        staff.setCanManageTables(true);
        staff.setCanViewReports(true);

        staffRepository.save(staff);
        log.info("Staff admin synchronized successfully: {} (Role: MANAGER, PIN: 1234) for Restaurant ID: {}", 
            staffName, restaurant.getId());
    }
}
