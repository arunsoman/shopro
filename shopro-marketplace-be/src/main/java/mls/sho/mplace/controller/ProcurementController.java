package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.ProcurementPolicy;
import mls.sho.mplace.service.MidMindService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/operator/automation")
@RequiredArgsConstructor
public class ProcurementController {

    private final MidMindService midMindService;

    @GetMapping("/autopo/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Map.of("status", midMindService.getStatus().name()));
    }

    @PostMapping("/autopo/start")
    public ResponseEntity<?> startEngine() {
        midMindService.startEngine();
        return ResponseEntity.ok(Map.of("message", "Engine started"));
    }

    @PostMapping("/autopo/stop")
    public ResponseEntity<?> stopEngine() {
        midMindService.stopEngine();
        return ResponseEntity.ok(Map.of("message", "Engine stopped"));
    }

    @PostMapping("/autopo/run-batch")
    public ResponseEntity<?> runBatch() {
        midMindService.routePendingOrders();
        return ResponseEntity.ok(Map.of("message", "Batch consolidation triggered"));
    }

    @GetMapping("/settings/{key}")
    public ResponseEntity<?> getSetting(@PathVariable String key) {
        String val = midMindService.getSetting(key);
        return ResponseEntity.ok(Map.of("key", key, "status", val));
    }

    @PostMapping("/settings")
    public ResponseEntity<?> updateSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        midMindService.updateSetting(key, value);
        return ResponseEntity.ok(Map.of("message", "Setting updated"));
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        // Mock data or fetch from repository if implemented
        return ResponseEntity.ok(Map.of("policies", "TODO"));
    }

    @PatchMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> config) {
        // Logic to update ProcurementPolicy
        return ResponseEntity.ok(Map.of("status", "SUCCESS"));
    }
}
