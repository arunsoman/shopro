package mls.sho.dms.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.AuditLog;
import mls.sho.dms.repository.AuditLogRepository;
import mls.sho.dms.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for audit log management.
 * 
 * Permissions:
 * - Admin (Owner): Full access (READ, DELETE, EXPORT)
 * - Manager: READ all, EXPORT (no DELETE)
 * - Server/Kitchen/Cashier: No access
 * - System: Auto-created entries only
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    /**
     * List audit logs with filtering and pagination.
     * 
     * Accessible to: Manager, Admin
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        // Validate page size
        size = Math.min(size, 100);

        // Parse action enum
        AuditLog.AuditAction auditAction = null;
        if (action != null && !action.isEmpty()) {
            try {
                auditAction = AuditLog.AuditAction.valueOf(action.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid action filter: {}", action);
            }
        }

        // Create sort
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Query with filters
        Page<AuditLog> auditPage = auditLogRepository.findWithFilters(
                startDate, endDate, username, entityName, auditAction, ipAddress, pageable);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("content", auditPage.getContent());
        response.put("page", auditPage.getNumber());
        response.put("size", auditPage.getSize());
        response.put("totalElements", auditPage.getTotalElements());
        response.put("totalPages", auditPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a single audit log entry by ID.
     * 
     * Accessible to: Manager, Admin
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getAuditLog(@PathVariable Long id) {
        return auditLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Export audit logs to CSV or JSON format.
     * 
     * Accessible to: Admin only
     * 
     * @param format Export format: "csv" or "json" (default: json)
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestParam(required = false, defaultValue = "json") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String ipAddress) {

        // Parse action enum
        AuditLog.AuditAction auditAction = null;
        if (action != null && !action.isEmpty()) {
            try {
                auditAction = AuditLog.AuditAction.valueOf(action.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid action filter for export: {}", action);
            }
        }

        // Get all matching logs (without pagination for export)
        Pageable pageable = PageRequest.of(0, 10000, Sort.by("timestamp").descending());
        Page<AuditLog> auditPage = auditLogRepository.findWithFilters(
                startDate, endDate, username, entityName, auditAction, ipAddress, pageable);
        List<AuditLog> logs = auditPage.getContent();

        String filename = "audit-logs-" + LocalDateTime.now().toString().replace(":", "-") + "." + format;
        byte[] data;

        if ("csv".equalsIgnoreCase(format)) {
            data = convertToCsv(logs);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(data);
        } else {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                mapper.findAndRegisterModules();
                data = mapper.writeValueAsBytes(logs);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(data);
            } catch (Exception e) {
                log.error("Failed to export audit logs to JSON", e);
                return ResponseEntity.internalServerError().build();
            }
        }
    }

    /**
     * Delete a single audit log entry.
     * 
     * Accessible to: Admin only
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditLog(@PathVariable Long id) {
        if (!auditLogRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        auditLogRepository.deleteById(id);
        log.info("Audit log entry {} deleted", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get audit log statistics (for dashboard).
     * 
     * Accessible to: Manager, Admin
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAuditStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        // Default to last 30 days if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        List<AuditLog> logs = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEntries", logs.size());
        
        // Count by action
        Map<String, Long> byAction = new HashMap<>();
        for (AuditLog.AuditAction action : AuditLog.AuditAction.values()) {
            byAction.put(action.name(), logs.stream()
                    .filter(l -> l.getAction() == action)
                    .count());
        }
        stats.put("byAction", byAction);

        // Count by entity
        Map<String, Long> byEntity = new HashMap<>();
        logs.stream()
                .map(AuditLog::getEntityName)
                .distinct()
                .forEach(entity -> byEntity.put(entity, 
                        logs.stream().filter(l -> l.getEntityName().equals(entity)).count()));
        stats.put("byEntity", byEntity);

        // Count by user
        Map<String, Long> byUser = new HashMap<>();
        logs.stream()
                .map(AuditLog::getUsername)
                .distinct()
                .forEach(user -> byUser.put(user,
                        logs.stream().filter(l -> l.getUsername().equals(user)).count()));
        stats.put("byUser", byUser);

        return ResponseEntity.ok(stats);
    }

    /**
     * Convert audit logs to CSV format.
     */
    private byte[] convertToCsv(List<AuditLog> logs) {
        StringBuilder csv = new StringBuilder();
        csv.append("id,username,action,entity_name,entity_id,details,timestamp,ip_address\n");
        
        for (AuditLog log : logs) {
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s,%s\n",
                    log.getId(),
                    escapeCsv(log.getUsername()),
                    log.getAction(),
                    escapeCsv(log.getEntityName()),
                    escapeCsv(log.getEntityId()),
                    escapeCsv(log.getDetails()),
                    log.getTimestamp(),
                    escapeCsv(log.getIpAddress())
            ));
        }
        
        return csv.toString().getBytes();
    }

    /**
     * Escape CSV values.
     */
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
