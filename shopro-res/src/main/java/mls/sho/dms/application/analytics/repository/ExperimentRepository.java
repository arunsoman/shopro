package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.common.enums.ExperimentStatus;
import mls.sho.dms.common.enums.ManagerRole;
import mls.sho.dms.application.engineering.entity.Experiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, UUID> {
    
    List<Experiment> findByRestaurantId(Long restaurantId);
    
    List<Experiment> findByStatusAndOwnerRole(ExperimentStatus status, ManagerRole ownerRole);
    
    @Query("SELECT e FROM Experiment e WHERE e.status = :status AND e.endDate < :now")
    List<Experiment> findExpiredExperiments(
        @org.springframework.data.repository.query.Param("status") ExperimentStatus status, 
        @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now
    );
    
    boolean existsByExperimentKey(String experimentKey);
}
