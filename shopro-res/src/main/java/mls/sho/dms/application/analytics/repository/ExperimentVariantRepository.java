package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.entity.experiment.ExperimentVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperimentVariantRepository extends JpaRepository<ExperimentVariant, UUID> {
    List<ExperimentVariant> findByExperimentId(UUID experimentId);
}
