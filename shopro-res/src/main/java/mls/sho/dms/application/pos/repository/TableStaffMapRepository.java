package mls.sho.dms.application.pos.repository;

import mls.sho.dms.application.pos.entity.TableStaffMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for staff-table assignment mappings.
 */
@Repository
public interface TableStaffMapRepository extends JpaRepository<TableStaffMap, Long> {

    /**
     * Find all active staff assignments for a specific table.
     */
    List<TableStaffMap> findByTableIdAndIsActiveTrue(Long tableId);

    /**
     * Find all active tables assigned to a specific staff member.
     */
    List<TableStaffMap> findByStaff_StaffIdAndIsActiveTrue(UUID staffId);

    /**
     * Find all active staff-table mappings for a restaurant.
     */
    List<TableStaffMap> findByRestaurantIdAndIsActiveTrue(Long restaurantId);

    /**
     * Find the primary server for a specific table.
     */
    @Query("SELECT tsm FROM TableStaffMap tsm WHERE tsm.table.id = :tableId " +
           "AND tsm.assignmentType = 'PRIMARY' AND tsm.isActive = true")
    Optional<TableStaffMap> findPrimaryServerForTable(@Param("tableId") Long tableId);

    /**
     * Find all staff (both primary and secondary) assigned to a specific table.
     */
    @Query("SELECT tsm FROM TableStaffMap tsm WHERE tsm.table.id = :tableId " +
           "AND tsm.isActive = true ORDER BY tsm.assignmentType")
    List<TableStaffMap> findAllServersForTable(@Param("tableId") Long tableId);

    /**
     * Find the staff assignment for a specific table and staff combination.
     */
    Optional<TableStaffMap> findByTableIdAndStaff_StaffIdAndIsActiveTrue(Long tableId, UUID staffId);

    /**
     * Count active tables assigned to a staff member.
     */
    long countByStaff_StaffIdAndIsActiveTrue(UUID staffId);
}
