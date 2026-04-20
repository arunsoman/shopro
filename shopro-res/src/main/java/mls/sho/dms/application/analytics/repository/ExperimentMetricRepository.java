package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.application.engineering.entity.ExperimentMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperimentMetricRepository extends JpaRepository<ExperimentMetric, UUID> {
    
    List<ExperimentMetric> findByExperimentId(UUID experimentId);
    
    @Query("SELECT m FROM ExperimentMetric m WHERE m.experiment.id = :experimentId " +
           "AND m.metricDate >= :startDate AND m.metricDate <= :endDate ORDER BY m.metricDate ASC")
    List<ExperimentMetric> findByExperimentAndDateRange(
        @Param("experimentId") java.util.UUID experimentId,
        @Param("startDate") java.time.LocalDate startDate,
        @Param("endDate") java.time.LocalDate endDate
    );

    List<ExperimentMetric> findByVariantId(UUID variantId);
}
