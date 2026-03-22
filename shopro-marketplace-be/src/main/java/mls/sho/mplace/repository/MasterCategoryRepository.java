package mls.sho.mplace.repository;

import mls.sho.mplace.entity.MasterCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MasterCategoryRepository extends JpaRepository<MasterCategory, UUID> {
    List<MasterCategory> findByParentIsNull();
    List<MasterCategory> findByParent_Id(UUID parentId);
}
