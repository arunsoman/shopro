package mls.sho.dms.application.costing.repository;

import mls.sho.dms.application.costing.entity.RecipeProcedureStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeProcedureStepRepository extends JpaRepository<RecipeProcedureStep, Long> {
}
