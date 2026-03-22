package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {
    List<Quote> findByBidInvitation_Id(UUID bidInvitationId);
    List<Quote> findAllBySupplier_Id(UUID supplierId);
}
