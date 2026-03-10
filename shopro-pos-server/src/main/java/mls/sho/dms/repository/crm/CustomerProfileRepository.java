package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    Optional<CustomerProfile> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT c FROM CustomerProfile c LEFT JOIN FETCH c.loyaltyTier " +
           "WHERE LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CustomerProfile> searchByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM CustomerProfile c LEFT JOIN FETCH c.loyaltyTier")
    Page<CustomerProfile> findAllWithTier(Pageable pageable);

    @Query("SELECT c FROM CustomerProfile c WHERE c.lastVisitAt < :cutoffDate AND c.isChurned = false")
    List<CustomerProfile> findAtRiskCustomers(@Param("cutoffDate") Instant cutoffDate);

    @Query("SELECT COUNT(c) FROM CustomerProfile c WHERE c.lastVisitAt >= :since")
    long countActiveMembers(@Param("since") Instant since);

    @Query("SELECT COUNT(c) FROM CustomerProfile c WHERE c.createdAt >= :since")
    long countNewEnrollments(@Param("since") Instant since);

    @Query("SELECT SUM(c.availablePoints) FROM CustomerProfile c")
    Long getTotalPointsLiability();

    @Query("SELECT AVG(c.lifetimeSpend) FROM CustomerProfile c WHERE c.visitCount > 0")
    Double getAverageClv();
}
