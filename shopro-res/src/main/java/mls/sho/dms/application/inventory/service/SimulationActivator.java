package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.entity.Restaurant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SimulationActivator implements CommandLineRunner {

    private final BusinessSimulatorService simulatorService;
    private final RestaurantRepository restaurantRepository;

    @Override
    public void run(String... args) throws Exception {
        // We look for a flag to 'fire' the simulation
        // Usage: ./gradlew bootRun --args='--simulate=true'
        boolean trigger = false;
        if (args != null) {
            for (String arg : args) {
                if (arg != null && arg.contains("--simulate=true")) {
                    trigger = true;
                    break;
                }
            }
        }

        if (trigger) {
            log.info("🚀 Simulation trigger detected! Starting 30-day firing sequence...");
            Restaurant devRes = restaurantRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No restaurant found to simulate."));
            
            simulatorService.runSimulation(devRes.getId(), 30);
            log.info("✅ Firing sequence complete. Historical data generated.");
        }
    }
}
