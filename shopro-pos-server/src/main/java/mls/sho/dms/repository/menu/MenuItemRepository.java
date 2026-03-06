package mls.sho.dms.repository.menu;

import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    boolean existsByNameIgnoreCaseAndCategory(String name, MenuCategory category);

    // Don't count the current item when updating
    boolean existsByNameIgnoreCaseAndCategoryAndIdNot(String name, MenuCategory category, UUID id);

    List<MenuItem> findByCategoryAndStatus(MenuCategory category, MenuItemStatus status);

    List<MenuItem> findByCategoryIdAndStatus(UUID categoryId, MenuItemStatus status);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.status IN :statuses ORDER BY m.category.displayOrder, m.name")
    List<MenuItem> findAllByStatusIn(@Param("statuses") java.util.Collection<MenuItemStatus> statuses);

    Optional<MenuItem> findByIdAndStatus(UUID id, MenuItemStatus status);
    
    long countByCategoryAndStatus(MenuCategory category, MenuItemStatus status);
}
