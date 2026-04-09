package mls.sho.dms.application.simulator.core;

import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.application.inventory.web.InventoryController;
import mls.sho.dms.application.pos.web.PosController;
import mls.sho.dms.application.purchasing.web.PurchasingController;
import mls.sho.dms.application.kds.web.StationKdsController;
import mls.sho.dms.application.kds.web.ExpoKdsController;
import mls.sho.dms.application.analytics.web.AnalyticsController;
import mls.sho.dms.application.primecost.controller.LaborController;
import mls.sho.dms.application.inventory.controller.SimulationController;
import mls.sho.dms.application.kds.security.KdsDevicePrincipal;
import mls.sho.dms.entity.MenuItem;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicReference;

import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

/**
 * Shared context for the Simulation engine. 
 * Provides agents with access to REST Controllers and the simulation clock/logger.
 * STRICTLY NO REPOSITORIES OR SERVICES ALLOWED HERE.
 */
@Getter
@Setter
@Service
public class SimulationWorld {

    private final SimulationConfig config;
    
    // Controllers (Manually injected by BusinessSimulatorService to break cycles)
    private PosController posController;
    private InventoryController inventoryController;
    private PurchasingController purchasingController;
    private StationKdsController stationKdsController;
    private ExpoKdsController expoKdsController;
    private AnalyticsController analyticsController;
    private LaborController laborController;
    private SimulationController simulationController;

    public SimulationWorld(SimulationConfig config,
                           @Lazy PosController posController,
                           @Lazy InventoryController inventoryController,
                           @Lazy PurchasingController purchasingController,
                           @Lazy StationKdsController stationKdsController,
                           @Lazy ExpoKdsController expoKdsController,
                           @Lazy AnalyticsController analyticsController,
                           @Lazy LaborController laborController,
                           @Lazy SimulationController simulationController
    )
    {
        this.config = config;
        this.simulationController = simulationController;
            this.posController = posController;
    this.inventoryController = inventoryController;
    this.purchasingController = purchasingController;
    this.stationKdsController =  stationKdsController;
    this.expoKdsController = expoKdsController;
    this.analyticsController = analyticsController;
    this.laborController =  laborController;
    }

    private Restaurant restaurant;
    private final AtomicReference<SimulationClock> clock = new AtomicReference<>();
    private final AtomicReference<SimulationLogger> logger = new AtomicReference<>();
    private final SimulationEventBus eventBus = new SimulationEventBus();

    private double timeMultiplier = 3600.0;

    private List<MenuItem> hydratedMenu = new CopyOnWriteArrayList<>();

    public void setHydratedMenu(List<MenuItem> menu) {
        this.hydratedMenu = new CopyOnWriteArrayList<>(menu);
    }

    public void log(byte agentType, long agentId, byte eventType, String message) {
        SimulationLogger l = logger.get();
        SimulationClock c = clock.get();
        if (l != null && c != null) {
            l.logEvent(c.getCurrentTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli(), 
                       agentType, agentId, eventType, message);
        }
    }
    
    public long getSimTimeMillis() {
        SimulationClock c = clock.get();
        return (c != null) ? c.getCurrentTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0;
    }

    /**
     * Executes an action as an authenticated KDS Device.
     * Required to call StationKdsController methods.
     */
    public void runAsKdsDevice(Long tableId, String deviceName, Runnable action) {
        KdsDevicePrincipal principal = new KdsDevicePrincipal(tableId, deviceName);
        var auth = new UsernamePasswordAuthenticationToken(
            principal, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_KDS_DEVICE"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            action.run();
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Executes an action as an authenticated Manager.
     * Required to call AnalyticsController methods.
     */
    public void runAsManager(Runnable action) {
        var auth = new UsernamePasswordAuthenticationToken(
            "SIM_MANAGER", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_MANAGER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            action.run();
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
