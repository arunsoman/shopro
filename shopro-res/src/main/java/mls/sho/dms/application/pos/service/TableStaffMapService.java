package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.pos.entity.DiningTable;
import mls.sho.dms.application.pos.entity.TableStaffMap;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.repository.TableStaffMapRepository;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing staff-table assignments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TableStaffMapService {

    private final TableStaffMapRepository tableStaffMapRepository;
    private final DiningTableRepository diningTableRepository;
    private final StaffRepository staffRepository;

    /**
     * Assign a staff member to a table.
     *
     * @param restaurant     The restaurant
     * @param table         The table to assign
     * @param staff         The staff member to assign
     * @param assignmentType Type of assignment (PRIMARY, SECONDARY, SUPPORT)
     * @param assignedBy     UUID of who is making the assignment
     * @return The created assignment
     */
    @Transactional
    public TableStaffMap assignStaff(Restaurant restaurant, DiningTable table, Staff staff,
                                      TableStaffMap.AssignmentType assignmentType, UUID assignedBy) {
        // Check if this staff is already assigned to this table
        Optional<TableStaffMap> existing = tableStaffMapRepository
                .findByTableIdAndStaff_StaffIdAndIsActiveTrue(table.getId(), staff.getStaffId());

        if (existing.isPresent()) {
            // If already assigned and active, just return it
            if (existing.get().getAssignmentType() == assignmentType) {
                return existing.get();
            }
            // If different assignment type, deactivate old and create new
            deactivateAssignment(existing.get(), null, null);
        }

        TableStaffMap assignment = TableStaffMap.builder()
                .restaurant(restaurant)
                .table(table)
                .staff(staff)
                .assignmentType(assignmentType)
                .assignedBy(assignedBy)
                .isActive(true)
                .build();

        return tableStaffMapRepository.save(assignment);
    }

    /**
     * Randomly assign available servers to unassigned tables.
     * Uses a simple round-robin style random assignment.
     *
     * @param restaurantId The restaurant ID
     * @param assignedBy   UUID of who is making the assignment
     * @return List of created assignments
     */
    @Transactional
    public List<TableStaffMap> assignRandom(Long restaurantId, UUID assignedBy) {
        List<TableStaffMap> assignments = new ArrayList<>();

        // Get all active servers for the restaurant
        List<Staff> servers = staffRepository.findActiveByRestaurantAndRole(restaurantId, StaffRole.SENIOR_SERVER);
        servers.addAll(staffRepository.findActiveByRestaurantAndRole(restaurantId, StaffRole.JUNIOR_SERVER));

        if (servers.isEmpty()) {
            log.warn("No servers found for restaurant {}", restaurantId);
            return assignments;
        }

        // Shuffle servers for randomness
        Collections.shuffle(servers);

        // Get all tables for the restaurant
        List<DiningTable> tables = diningTableRepository.findAllByRestaurantId(restaurantId);

        // Filter to only tables that need assignment (AVAILABLE or OCCUPIED, not already fully assigned)
        List<DiningTable> tablesNeedingStaff = tables.stream()
                .filter(table -> {
                    List<TableStaffMap> currentAssignments = tableStaffMapRepository
                            .findByTableIdAndIsActiveTrue(table.getId());
                    // Need primary server
                    boolean hasPrimary = currentAssignments.stream()
                            .anyMatch(a -> a.getAssignmentType() == TableStaffMap.AssignmentType.PRIMARY);
                    return !hasPrimary;
                })
                .collect(Collectors.toList());

        if (tablesNeedingStaff.isEmpty()) {
            log.info("All tables already have primary servers assigned for restaurant {}", restaurantId);
            return assignments;
        }

        // Get restaurant entity
        Restaurant restaurant = tables.get(0).getRestaurant();

        // Assign servers round-robin style
        int serverIndex = 0;
        for (DiningTable table : tablesNeedingStaff) {
            Staff server = servers.get(serverIndex % servers.size());

            TableStaffMap assignment = TableStaffMap.builder()
                    .restaurant(restaurant)
                    .table(table)
                    .staff(server)
                    .assignmentType(TableStaffMap.AssignmentType.PRIMARY)
                    .assignedBy(assignedBy)
                    .isActive(true)
                    .build();

            assignments.add(tableStaffMapRepository.save(assignment));
            serverIndex++;

            log.debug("Assigned server {} to table {}", server.getDisplayName(), table.getTableNumber());
        }

        log.info("Randomly assigned {} tables to servers for restaurant {}", assignments.size(), restaurantId);
        return assignments;
    }

    /**
     * Unassign a staff member from a table.
     *
     * @param tableId         The table ID
     * @param staffId        The staff ID
     * @param unassignedBy   UUID of who is making the unassignment
     * @param reason         Reason for unassignment
     */
    @Transactional
    public void unassignStaff(Long tableId, UUID staffId, UUID unassignedBy, String reason) {
        tableStaffMapRepository.findByTableIdAndStaff_StaffIdAndIsActiveTrue(tableId, staffId)
                .ifPresent(assignment -> deactivateAssignment(assignment, unassignedBy, reason));
    }

    /**
     * Unassign all staff from a specific table.
     *
     * @param tableId       The table ID
     * @param unassignedBy  UUID of who is making the unassignment
     * @param reason        Reason for unassignment
     */
    @Transactional
    public void unassignAllFromTable(Long tableId, UUID unassignedBy, String reason) {
        List<TableStaffMap> assignments = tableStaffMapRepository.findByTableIdAndIsActiveTrue(tableId);
        for (TableStaffMap assignment : assignments) {
            deactivateAssignment(assignment, unassignedBy, reason);
        }
    }

    /**
     * Get all active staff assignments for a table.
     *
     * @param tableId The table ID
     * @return List of staff assignments
     */
    @Transactional(readOnly = true)
    public List<TableStaffMap> getStaffForTable(Long tableId) {
        return tableStaffMapRepository.findByTableIdAndIsActiveTrue(tableId);
    }

    /**
     * Get the primary server for a table.
     *
     * @param tableId The table ID
     * @return Optional containing the primary server assignment
     */
    @Transactional(readOnly = true)
    public Optional<TableStaffMap> getPrimaryServerForTable(Long tableId) {
        return tableStaffMapRepository.findPrimaryServerForTable(tableId);
    }

    /**
     * Get all active tables for a staff member.
     *
     * @param staffId The staff ID
     * @return List of table assignments
     */
    @Transactional(readOnly = true)
    public List<TableStaffMap> getTablesForStaff(UUID staffId) {
        return tableStaffMapRepository.findByStaff_StaffIdAndIsActiveTrue(staffId);
    }

    /**
     * Get all active staff-table mappings for a restaurant.
     *
     * @param restaurantId The restaurant ID
     * @return List of all active assignments
     */
    @Transactional(readOnly = true)
    public List<TableStaffMap> getAllAssignments(Long restaurantId) {
        return tableStaffMapRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
    }

    /**
     * Count how many tables are assigned to a staff member.
     *
     * @param staffId The staff ID
     * @return Number of active table assignments
     */
    @Transactional(readOnly = true)
    public long getAssignedTableCount(UUID staffId) {
        return tableStaffMapRepository.countByStaff_StaffIdAndIsActiveTrue(staffId);
    }

    /**
     * Reassign a table from one server to another.
     *
     * @param tableId        The table ID
     * @param newStaffId    The new staff ID
     * @param reassignedBy  UUID of who is making the reassignment
     * @return The new assignment
     */
    @Transactional
    public TableStaffMap reassignTable(Long tableId, UUID newStaffId, UUID reassignedBy) {
        DiningTable table = diningTableRepository.findById(tableId)
                .orElseThrow(() -> new NoSuchElementException("Table not found: " + tableId));

        Staff newStaff = staffRepository.findById(newStaffId)
                .orElseThrow(() -> new NoSuchElementException("Staff not found: " + newStaffId));

        // Deactivate existing assignments for this table
        unassignAllFromTable(tableId, reassignedBy, "Reassigned to new server");

        // Create new assignment
        return assignStaff(table.getRestaurant(), table, newStaff,
                TableStaffMap.AssignmentType.PRIMARY, reassignedBy);
    }

    private void deactivateAssignment(TableStaffMap assignment, UUID unassignedBy, String reason) {
        assignment.setIsActive(false);
        assignment.setUnassignedAt(java.time.LocalDateTime.now());
        assignment.setUnassignedBy(unassignedBy);
        assignment.setUnassignedReason(reason);
        tableStaffMapRepository.save(assignment);
    }
}
