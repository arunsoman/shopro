package mls.sho.dms.repository.menu;

import mls.sho.dms.entity.menu.ModifierOption;
import mls.sho.dms.entity.menu.ModifierGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModifierOptionRepository extends JpaRepository<ModifierOption, UUID> {
    List<ModifierOption> findByModifierGroupOrderByDisplayOrderAsc(ModifierGroup group);
}
