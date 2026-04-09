package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.Outlet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutletRepository extends JpaRepository<Outlet, Long> {
    Optional<Outlet> findFirstByRestaurantId(Long restaurantId);
    List<Outlet> findAllByRestaurantId(Long restaurantId);
    Optional<Outlet> findBySlug(String slug);
}
