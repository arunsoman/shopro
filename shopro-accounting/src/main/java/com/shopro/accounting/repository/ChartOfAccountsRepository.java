package com.shopro.accounting.repository;

import com.shopro.accounting.entity.ChartOfAccounts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChartOfAccountsRepository extends JpaRepository<ChartOfAccounts, UUID> {
    
    List<ChartOfAccounts> findByRestaurantId(Long restaurantId);
    
    List<ChartOfAccounts> findByRestaurantIdOrderByAccountCode(Long restaurantId);
    
    Optional<ChartOfAccounts> findByRestaurantIdAndAccountCode(Long restaurantId, String accountCode);
    
    List<ChartOfAccounts> findByRestaurantIdAndAccountType(Long restaurantId, ChartOfAccounts.AccountType accountType);
    
    boolean existsByRestaurantIdAndAccountCode(Long restaurantId, String accountCode);
}
