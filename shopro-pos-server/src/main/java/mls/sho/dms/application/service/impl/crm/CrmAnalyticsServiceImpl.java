package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CrmDashboardStatsResponse;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.application.mapper.CustomerMapper;
import mls.sho.dms.application.service.crm.CrmAnalyticsService;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.LoyaltyConfigRepository;
import mls.sho.dms.entity.crm.LoyaltyConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CrmAnalyticsServiceImpl implements CrmAnalyticsService {

    private final CustomerProfileRepository customerRepository;
    private final LoyaltyConfigRepository configRepository;
    private final CustomerMapper customerMapper;

    @Override
    @Transactional(readOnly = true)
    public CrmDashboardStatsResponse getDashboardStats() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        
        Double avgClv = customerRepository.getAverageClv();
        long activeMembers = customerRepository.countActiveMembers(thirtyDaysAgo);
        long newEnrollments = customerRepository.countNewEnrollments(thirtyDaysAgo);
        Long pointsLiability = customerRepository.getTotalPointsLiability();
        
        BigDecimal redemptionValue = configRepository.findFirstByOrderByCreatedAtAsc()
                .map(LoyaltyConfig::getRedemptionValue)
                .orElse(new BigDecimal("0.01"));
        
        BigDecimal liabilityDollarValue = BigDecimal.valueOf(pointsLiability != null ? pointsLiability : 0)
                .multiply(redemptionValue);
        
        return CrmDashboardStatsResponse.builder()
                .avgClv(avgClv != null ? avgClv : 0.0)
                .activeMembers(activeMembers)
                .newEnrollments(newEnrollments)
                .totalPointsLiability(liabilityDollarValue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerProfileResponse> getAtRiskCustomers() {
        Instant sixtyDaysAgo = Instant.now().minus(60, ChronoUnit.DAYS);
        return customerRepository.findAtRiskCustomers(sixtyDaysAgo).stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }
}
