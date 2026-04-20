package mls.sho.dms.application.accounting.repository;

import mls.sho.dms.application.accounting.entity.SalaryDisbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalaryDisbursementRepository extends JpaRepository<SalaryDisbursement, UUID> {

    List<SalaryDisbursement> findByRestaurantIdOrderByPayDateDesc(Long restaurantId);

    List<SalaryDisbursement> findByRestaurantIdAndStatusOrderByPayDateDesc(Long restaurantId, SalaryDisbursement.DisbursementStatus status);

    List<SalaryDisbursement> findByStaffIdOrderByPayDateDesc(UUID staffId);

    List<SalaryDisbursement> findByRestaurantIdAndPayPeriodStartBetweenOrderByPayDateDesc(
            Long restaurantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(s.netPay) FROM SalaryDisbursement s WHERE s.restaurantId = :restaurantId AND s.status = 'DISBURSED'")
    BigDecimal getTotalDisbursedAmount(Long restaurantId);

    @Query("SELECT SUM(s.totalTax) FROM SalaryDisbursement s WHERE s.restaurantId = :restaurantId AND s.status = 'DISBURSED'")
    BigDecimal getTotalTaxWithheld(Long restaurantId);

    @Query("SELECT s FROM SalaryDisbursement s WHERE s.restaurantId = :restaurantId AND s.payPeriodStart = :periodStart AND s.payPeriodEnd = :periodEnd")
    List<SalaryDisbursement> findByPayPeriod(Long restaurantId, LocalDate periodStart, LocalDate periodEnd);
}
