package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.application.engineering.entity.ExperimentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperimentEventRepository extends JpaRepository<ExperimentEvent, UUID> {
    List<ExperimentEvent> findByExperimentIdOrderByCreatedAtDesc(UUID experimentId);
}
