package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, UUID> {
    List<LoyaltyTransaction> findByCustomerProfileIdOrderByCreatedAtDesc(UUID customerProfileId);
}
