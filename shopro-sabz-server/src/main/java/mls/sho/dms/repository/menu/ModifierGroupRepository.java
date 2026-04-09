package mls.sho.dms.repository.menu;

import mls.sho.dms.entity.menu.ModifierGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ModifierGroupRepository extends JpaRepository<ModifierGroup, UUID> {
    boolean existsByNameIgnoreCase(String name);
}
