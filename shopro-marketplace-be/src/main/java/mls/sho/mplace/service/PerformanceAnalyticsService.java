package mls.sho.mplace.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

/**
 * Service for calculating weighted supplier metrics.
 * Mock implementation as per User Request.
 */
@Service
public class PerformanceAnalyticsService {

    public double getReliabilityScore(UUID supplierId) {
        // Mocked based on supplier ID for determinism in testing
        int hash = supplierId.hashCode();
        return 85.0 + (Math.abs(hash) % 15); // Returns 85% to 100%
    }

    public double getFulfillmentQuality(UUID supplierId) {
        int hash = supplierId.toString().hashCode();
        return 4.0 + (Math.abs(hash) % 10) / 10.0; // Returns 4.0 to 5.0
    }

    public int getBidResponseRate(UUID supplierId) {
        int hash = (supplierId.toString() + "seed").hashCode();
        return 90 + (Math.abs(hash) % 10); // Returns 90% to 100%
    }
}
