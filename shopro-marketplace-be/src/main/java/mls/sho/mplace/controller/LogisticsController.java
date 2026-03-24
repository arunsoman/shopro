package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Hub;
import mls.sho.mplace.entity.LogisticsZone;
import mls.sho.mplace.repository.HubRepository;
import mls.sho.mplace.repository.LogisticsZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operator/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final HubRepository hubRepository;
    private final LogisticsZoneRepository zoneRepository;

    @GetMapping("/hubs")
    public List<Hub> getHubs() {
        return hubRepository.findAll();
    }

    @PostMapping("/hubs")
    public Hub createHub(@RequestBody Hub hub) {
        return hubRepository.save(hub);
    }

    @GetMapping("/zones")
    public List<LogisticsZone> getZones() {
        return zoneRepository.findAll();
    }

    @PostMapping("/zones")
    public LogisticsZone createZone(@RequestBody LogisticsZone zone) {
        return zoneRepository.save(zone);
    }
}
