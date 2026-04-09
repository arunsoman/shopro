package mls.sho.dms.repository.menu;

import mls.sho.dms.entity.menu.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
    
    List<MenuCategory> findAllByOrderByDisplayOrderAsc();
    
    Optional<MenuCategory> findTopByOrderByDisplayOrderDesc();
}
