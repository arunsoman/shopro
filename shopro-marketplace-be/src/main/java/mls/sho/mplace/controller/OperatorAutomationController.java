package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.AuditLogService;
import mls.sho.mplace.repository.AutoReorderRuleRepository;
import mls.sho.mplace.repository.POActivityRepository;
import mls.sho.mplace.dto.AutoPOStatsDto;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/operator/automation")
@RequiredArgsConstructor
public class OperatorAutomationController {

    private final AuditLogService auditLogService;
    private final AutoReorderRuleRepository autoReorderRuleRepository;
    private final POActivityRepository poActivityRepository;

    @GetMapping("/autopo/stats")
    public AutoPOStatsDto getAutoPOStats() {
        var since = java.time.LocalDateTime.now().minusHours(24);
        long total = poActivityRepository.countByActivityDateAfter(since);
        long failed = poActivityRepository.countByStatusAndActivityDateAfter("FAILED", since);
        
        double successRate = total > 0 ? ((double)(total - failed) / total) * 100 : 100.0;
        
        return new AutoPOStatsDto(
            (int)total,
            successRate,
            "48 / 64", // Mocked for now
            (int)failed,
            "+12%", // Trend mocked for now
            "-5%" // Trend mocked for now
        );
    }

    @GetMapping("/autopo/rules")
    public List<Map<String, Object>> getAutoPORules() {
        return autoReorderRuleRepository.findAll().stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId().toString());
                    map.put("name", r.getProduct().getName() + " Auto-Replenish");
                    map.put("trigger", "Stock < " + r.getAlert());
                    map.put("action", "Create PO (" + r.getReorderQuantity() + ")");
                    map.put("status", r.isActive() ? "Active" : "Paused");
                    return map;
                }).toList();
    }

    @GetMapping("/schedules")
    public List<Map<String, Object>> getSchedules() {
        return List.of(
            Map.of("id", "SCH-01", "task", "Email Digest", "schedule", "Daily 8AM", "lastRun", "Mar 20, 08:00", "nextRun", "Mar 21, 08:00", "status", "Success"),
            Map.of("id", "SCH-02", "task", "Price Sync", "schedule", "Hourly", "lastRun", "Mar 20, 14:00", "nextRun", "Mar 20, 15:00", "status", "Running")
        );
    }

    @GetMapping("/logic/blocks")
    public List<Map<String, Object>> getLogicBlocks() {
        return List.of(
            Map.of("id", "LOGIC-01", "name", "Fraud Filter", "type", "Interceptor", "complexity", "High", "enabled", true),
            Map.of("id", "LOGIC-02", "name", "Tax Calculator", "type", "Processor", "complexity", "Medium", "enabled", true)
        );
    }

    @GetMapping("/logs")
    public List<Map<String, Object>> getAutomationLogs() {
        return auditLogService.getRecentLogs().stream()
                .map(log -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", log.id().toString());
                    map.put("timestamp", log.time());
                    map.put("event", log.action());
                    map.put("source", log.user());
                    map.put("status", log.severity());
                    return map;
                }).toList();
    }
}
