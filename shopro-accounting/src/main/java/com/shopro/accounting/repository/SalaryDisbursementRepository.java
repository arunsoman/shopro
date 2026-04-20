package com.shopro.accounting.repository;

import com.shopro.accounting.entity.SalaryDisbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalaryDisbursementRepository extends JpaRepository<SalaryDisbursement, UUID> {
    
    List<SalaryDisbursement> findByRestaurantIdAndPayDate(Long restaurantId, LocalDate payDate);
    
    List<SalaryDisbursement> findByRestaurantIdAndPayPeriodStartBetween(
        Long restaurantId, 
        LocalDate start, 
        LocalDate end
    );
    
    List<SalaryDisbursement> findByStaffId(UUID staffId);
}
