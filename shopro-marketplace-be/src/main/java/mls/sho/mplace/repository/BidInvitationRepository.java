package mls.sho.mplace.repository;

import mls.sho.mplace.entity.BidInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidInvitationRepository extends JpaRepository<BidInvitation, UUID> {
    @Query("SELECT b FROM BidInvitation b WHERE b.purchaseOrder.restaurant.id = :restaurantId")
    List<BidInvitation> findAllByRestaurant_Id(UUID restaurantId);
}
