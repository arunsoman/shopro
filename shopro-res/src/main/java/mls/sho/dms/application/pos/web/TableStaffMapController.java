package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.entity.TableStaffMap;
import mls.sho.dms.application.pos.service.TableStaffMapService;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.application.users.repo.StaffRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for staff-table assignment management.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/table-staff")
@RequiredArgsConstructor
public class TableStaffMapController {

    private final TableStaffMapService tableStaffMapService;
    private final StaffRepository staffRepository;
    private final mls.sho.dms.application.pos.repository.DiningTableRepository diningTableRepository;

    /**
     * Get all staff-table assignments for the restaurant.
     * Shows all users and their table mappings.
     */
    @GetMapping
    public ResponseEntity<List<TableStaffMapResponse>> getAllAssignments(@PathVariable Long restaurantId) {
        List<TableStaffMap> assignments = tableStaffMapService.getAllAssignments(restaurantId);
        return ResponseEntity.ok(assignments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    /**
     * Get all users and their table assignments.
     * Grouped by staff member.
     */
    @GetMapping("/by-staff")
    public ResponseEntity<List<StaffTableMappingResponse>> getMappingsByStaff(@PathVariable Long restaurantId) {
        List<Staff> staffList = staffRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
        
        List<StaffTableMappingResponse> response = staffList.stream()
                .map(staff -> {
                    List<TableStaffMap> assignments = tableStaffMapService.getTablesForStaff(staff.getStaffId());
                    return StaffTableMappingResponse.builder()
                            .staffId(staff.getStaffId())
                            .staffName(staff.getDisplayName())
                            .role(staff.getRole().name())
                            .tableCount(assignments.size())
                            .assignments(assignments.stream()
                                    .map(this::toSummaryResponse)
                                    .collect(Collectors.toList()))
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get tables assigned to a specific staff member.
     */
    @GetMapping("/staff/{staffId}/tables")
    public ResponseEntity<StaffTableMappingResponse> getTablesForStaff(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId) {
        
        Staff staff = staffRepository.findByStaffIdAndRestaurantIdAndIsActiveTrue(staffId, restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Staff not found: " + staffId));

        List<TableStaffMap> assignments = tableStaffMapService.getTablesForStaff(staffId);

        return ResponseEntity.ok(StaffTableMappingResponse.builder()
                .staffId(staff.getStaffId())
                .staffName(staff.getDisplayName())
                .role(staff.getRole().name())
                .tableCount(assignments.size())
                .assignments(assignments.stream()
                        .map(this::toSummaryResponse)
                        .collect(Collectors.toList()))
                .build());
    }

    /**
     * Get all staff-table assignments for the restaurant filtered by table ID.
     */
    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<TableStaffMapResponse>> getAssignmentsByTable(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId) {
        
        List<TableStaffMap> assignments = tableStaffMapService.getStaffForTable(tableId);
        return ResponseEntity.ok(assignments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList()));
    }

    /**
     * Get all staff-table assignments for the restaurant filtered by staff ID (user ID).
     */
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<StaffTableMappingResponse> getAssignmentsByStaff(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId) {
        
        Staff staff = staffRepository.findByStaffIdAndRestaurantIdAndIsActiveTrue(staffId, restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Staff not found: " + staffId));

        List<TableStaffMap> assignments = tableStaffMapService.getTablesForStaff(staffId);

        return ResponseEntity.ok(StaffTableMappingResponse.builder()
                .staffId(staff.getStaffId())
                .staffName(staff.getDisplayName())
                .role(staff.getRole().name())
                .tableCount(assignments.size())
                .assignments(assignments.stream()
                        .map(this::toSummaryResponse)
                        .collect(Collectors.toList()))
                .build());
    }

    /**
     * Get primary server for a specific table.
     */
    @GetMapping("/table/{tableId}/primary-server")
    public ResponseEntity<TableStaffMapResponse> getPrimaryServer(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId) {
        
        return tableStaffMapService.getPrimaryServerForTable(tableId)
                .map(assignment -> ResponseEntity.ok(toResponse(assignment)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Randomly assign servers to unassigned tables.
     */
    @PostMapping("/assign-random")
    public ResponseEntity<AssignRandomResponse> assignRandom(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) UUID assignedBy) {
        
        UUID actor = assignedBy != null ? assignedBy : UUID.randomUUID();
        List<TableStaffMap> assignments = tableStaffMapService.assignRandom(restaurantId, actor);

        return ResponseEntity.ok(AssignRandomResponse.builder()
                .restaurantId(restaurantId)
                .assignedCount(assignments.size())
                .assignments(assignments.stream()
                        .map(this::toSummaryResponse)
                        .collect(Collectors.toList()))
                .build());
    }

    /**
     * Assign a specific staff member to a table.
     */
    @PostMapping("/assign")
    public ResponseEntity<TableStaffMapResponse> assignStaff(
            @PathVariable Long restaurantId,
            @RequestBody AssignStaffRequest request) {
        
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new NoSuchElementException("Staff not found: " + request.getStaffId()));

        var diningTable = diningTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new NoSuchElementException("Table not found: " + request.getTableId()));

        var assignmentType = request.getAssignmentType() != null 
                ? TableStaffMap.AssignmentType.valueOf(request.getAssignmentType())
                : TableStaffMap.AssignmentType.PRIMARY;

        TableStaffMap assignment = tableStaffMapService.assignStaff(
                diningTable.getRestaurant(),
                diningTable,
                staff,
                assignmentType,
                request.getAssignedBy()
        );

        return ResponseEntity.ok(toResponse(assignment));
    }

    /**
     * Change (reassign) table-staff association.
     */
    @PutMapping("/table/{tableId}/reassign")
    public ResponseEntity<TableStaffMapResponse> reassignTable(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId,
            @RequestBody ReassignTableRequest request) {
        
        TableStaffMap assignment = tableStaffMapService.reassignTable(
                tableId, 
                request.getNewStaffId(), 
                request.getReassignedBy()
        );

        return ResponseEntity.ok(toResponse(assignment));
    }

    /**
     * Unassign all staff from a table.
     */
    @DeleteMapping("/table/{tableId}/unassign")
    public ResponseEntity<Void> unassignAllFromTable(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId,
            @RequestParam UUID unassignedBy,
            @RequestParam(required = false, defaultValue = "Manual unassignment") String reason) {
        
        tableStaffMapService.unassignAllFromTable(tableId, unassignedBy, reason);
        return ResponseEntity.noContent().build();
    }

    /**
     * Unassign a specific staff from a table.
     */
    @DeleteMapping("/table/{tableId}/staff/{staffId}/unassign")
    public ResponseEntity<Void> unassignStaff(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId,
            @PathVariable UUID staffId,
            @RequestParam UUID unassignedBy,
            @RequestParam(required = false, defaultValue = "Manual unassignment") String reason) {
        
        tableStaffMapService.unassignStaff(tableId, staffId, unassignedBy, reason);
        return ResponseEntity.noContent().build();
    }

    // ============ DTOs and Mappers ============

    private TableStaffMapResponse toResponse(TableStaffMap assignment) {
        return TableStaffMapResponse.builder()
                .id(assignment.getId())
                .tableId(assignment.getTable().getId())
                .tableNumber(assignment.getTable().getTableNumber())
                .staffId(assignment.getStaff().getStaffId())
                .staffName(assignment.getStaff().getDisplayName())
                .staffRole(assignment.getStaff().getRole().name())
                .assignmentType(assignment.getAssignmentType().name())
                .assignedAt(assignment.getAssignedAt())
                .assignedBy(assignment.getAssignedBy())
                .isActive(assignment.getIsActive())
                .build();
    }

    private TableStaffSummaryResponse toSummaryResponse(TableStaffMap assignment) {
        return TableStaffSummaryResponse.builder()
                .id(assignment.getId())
                .tableId(assignment.getTable().getId())
                .tableNumber(assignment.getTable().getTableNumber())
                .assignmentType(assignment.getAssignmentType().name())
                .assignedAt(assignment.getAssignedAt())
                .isActive(assignment.getIsActive())
                .build();
    }

    // ============ Request/Response DTOs ============

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TableStaffMapResponse {
        private Long id;
        private Long tableId;
        private String tableNumber;
        private UUID staffId;
        private String staffName;
        private String staffRole;
        private String assignmentType;
        private java.time.LocalDateTime assignedAt;
        private UUID assignedBy;
        private Boolean isActive;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TableStaffSummaryResponse {
        private Long id;
        private Long tableId;
        private String tableNumber;
        private String assignmentType;
        private java.time.LocalDateTime assignedAt;
        private Boolean isActive;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class StaffTableMappingResponse {
        private UUID staffId;
        private String staffName;
        private String role;
        private Integer tableCount;
        private List<TableStaffSummaryResponse> assignments;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AssignRandomResponse {
        private Long restaurantId;
        private Integer assignedCount;
        private List<TableStaffSummaryResponse> assignments;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AssignStaffRequest {
        private Long tableId;
        private UUID staffId;
        private String assignmentType;
        private UUID assignedBy;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReassignTableRequest {
        private UUID newStaffId;
        private UUID reassignedBy;
    }
}
