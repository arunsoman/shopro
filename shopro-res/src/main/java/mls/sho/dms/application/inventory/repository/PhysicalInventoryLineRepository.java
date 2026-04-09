package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.application.inventory.entity.PhysicalInventoryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhysicalInventoryLineRepository extends JpaRepository<PhysicalInventoryLine, Long> {
    List<PhysicalInventoryLine> findAllByPeriodId(Long periodId);
}
