package mls.sho.dms.application.accounting.repository;

import mls.sho.dms.application.accounting.entity.ChartOfAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, UUID> {

    List<ChartOfAccount> findByRestaurantIdAndIsActiveTrue(Long restaurantId);

    List<ChartOfAccount> findByRestaurantId(Long restaurantId);

    Optional<ChartOfAccount> findByAccountCode(String accountCode);

    List<ChartOfAccount> findByAccountType(ChartOfAccount.AccountType accountType);

    List<ChartOfAccount> findByRestaurantIdAndAccountType(Long restaurantId, ChartOfAccount.AccountType accountType);

    boolean existsByAccountCode(String accountCode);
}
