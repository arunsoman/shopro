package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.kds.entity.Outlet;
import mls.sho.dms.application.kds.entity.KdsSettings;
import mls.sho.dms.application.kds.repository.OutletRepository;
import mls.sho.dms.application.kds.repository.KdsSettingsRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.entity.Restaurant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Order(2) // Run after ShoProUserSeeder
@RequiredArgsConstructor
@Slf4j
public class KdsDataSeeder implements CommandLineRunner {

    private final OutletRepository outletRepository;
    private final KdsSettingsRepository settingsRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public void run(String... args) throws Exception {
        seedDefaultKdsData();
    }

    private void seedDefaultKdsData() {
        if (outletRepository.count() > 0) {
            return;
        }

        Restaurant restaurant = restaurantRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("No restaurant found to link KDS outlet!"));

        log.info("Seeding default KDS outlet: Main Kitchen for restaurant ID: {}", restaurant.getId());

        Outlet outlet = Outlet.builder()
            .restaurantId(restaurant.getId())
            .name("Main Kitchen")
            .slug("main-kitchen")
            .timezone(restaurant.getTimezone())
            .active(true)
            .createdAt(LocalDateTime.now())
            .build();

        outlet = outletRepository.save(outlet);
        log.info("Default KDS outlet created with ID: {}", outlet.getId());

        // Ensure KDS settings exist for this outlet
        if (settingsRepository.findByOutletId(outlet.getId()).isEmpty()) {
            log.info("Seeding default KDS settings for outlet ID: {}", outlet.getId());
            KdsSettings settings = KdsSettings.builder()
                .outletId(outlet.getId())
                .warnThresholdSeconds(300)
                .alertThresholdSeconds(600)
                .maxTicketsPerScreen(6)
                .sortOrder(KdsSettings.SortOrder.FIRED_ASC)
                .enableAudioAlerts(true)
                .enableStartAction(false)
                .build();
            settingsRepository.save(settings);
        }
    }
}
