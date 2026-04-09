package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.ItemTaxTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemTaxTagRepository extends JpaRepository<ItemTaxTag, java.util.UUID> {
    Optional<ItemTaxTag> findByMenuItemId(UUID menuItemId);
}
