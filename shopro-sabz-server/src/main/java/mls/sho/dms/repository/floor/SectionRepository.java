package mls.sho.dms.repository.floor;

import mls.sho.dms.entity.floor.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {
    Optional<Section> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
