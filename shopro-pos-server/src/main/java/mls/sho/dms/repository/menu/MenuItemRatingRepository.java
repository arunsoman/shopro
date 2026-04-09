package mls.sho.dms.repository.menu;

import mls.sho.dms.entity.inventory.menu.MenuItemRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRatingRepository extends JpaRepository<MenuItemRating, UUID> {
    List<MenuItemRating> findByMenuItemId(UUID menuItemId);
}
