package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.GuestFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface GuestFeedbackRepository extends JpaRepository<GuestFeedback, UUID> {

    @Modifying
    @Query("UPDATE GuestFeedback f SET f.customer = :target WHERE f.customer = :source")
    void updateCustomer(@Param("source") CustomerProfile source, @Param("target") CustomerProfile target);
    
    Page<GuestFeedback> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    @Query("SELECT AVG(f.rating) FROM GuestFeedback f")
    Double getAverageRating();

    @Query("SELECT COUNT(f) FROM GuestFeedback f WHERE f.sentiment = 'POSITIVE'")
    Long countPositiveFeedback();
    
    @Query("SELECT COUNT(f) FROM GuestFeedback f WHERE f.sentiment = 'NEUTRAL'")
    Long countNeutralFeedback();

    @Query("SELECT COUNT(f) FROM GuestFeedback f WHERE f.sentiment = 'NEGATIVE'")
    Long countNegativeFeedback();

    @Query("SELECT new mls.sho.dms.application.dto.crm.ServerFeedbackStatsResponse(" +
           "s.id, s.fullName, COUNT(f), AVG(CAST(f.rating AS double))) " +
           "FROM GuestFeedback f " +
           "JOIN OrderTicket ot ON CAST(ot.id AS string) = f.orderId " +
           "JOIN ot.server s " +
           "GROUP BY s.id, s.fullName")
    List<mls.sho.dms.application.dto.crm.ServerFeedbackStatsResponse> getServerStats();
}
