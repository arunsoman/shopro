package mls.sho.mplace.repository;

import mls.sho.mplace.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findAllByRestaurant_Id(UUID restaurantId);
    List<SupportTicket> findAllBySupplier_Id(UUID supplierId);
}
