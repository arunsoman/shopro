package mls.sho.dms.application.costing.repository;

import mls.sho.dms.entity.RecipeBuildChart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeBuildChartRepository extends JpaRepository<RecipeBuildChart, Long> {
}
