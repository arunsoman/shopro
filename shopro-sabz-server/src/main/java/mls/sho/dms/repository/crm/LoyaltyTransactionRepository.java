package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, UUID> {
    List<LoyaltyTransaction> findByCustomerProfileIdOrderByCreatedAtDesc(UUID customerProfileId);

    @Modifying
    @Query("UPDATE LoyaltyTransaction lt SET lt.customerProfile = :target WHERE lt.customerProfile = :source")
    void updateCustomerProfile(@Param("source") CustomerProfile source, @Param("target") CustomerProfile target);
}
