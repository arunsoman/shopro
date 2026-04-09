package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.LoyaltyTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class CustomerProfileRepositoryTest {

    @Autowired
    private CustomerProfileRepository customerRepository;

    @Autowired
    private LoyaltyTierRepository tierRepository;

    private LoyaltyTier defaultTier;

    @BeforeEach
    void setUp() {
        defaultTier = new LoyaltyTier();
        defaultTier.setName("TEST_TIER");
        defaultTier.setSpendThreshold(BigDecimal.ZERO);
        defaultTier.setPointMultiplier(BigDecimal.ONE);
        tierRepository.save(defaultTier);

        CustomerProfile customer1 = new CustomerProfile();
        customer1.setFirstName("Alice");
        customer1.setLastName("Alison");
        customer1.setPhoneNumber("+1111111111");
        customer1.setEmail("alice@test.com");
        customer1.setLoyaltyTier(defaultTier);
        customerRepository.save(customer1);

        CustomerProfile customer2 = new CustomerProfile();
        customer2.setFirstName("Bob");
        customer2.setLastName("Dylan");
        customer2.setPhoneNumber("+2222222222");
        customerRepository.save(customer2);
    }

    @Test
    void findByPhoneNumber_Exists_ReturnsCustomer() {
        Optional<CustomerProfile> result = customerRepository.findByPhoneNumber("+1111111111");
        assertTrue(result.isPresent());
        assertEquals("Alice", result.get().getFirstName());
    }

    @Test
    void searchByQuery_MatchFirstName_ReturnsMatch() {
        Page<CustomerProfile> result = customerRepository.searchByQuery("Ali", PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("Alice", result.getContent().get(0).getFirstName());
    }

    @Test
    void searchByQuery_MatchPhone_ReturnsMatch() {
        Page<CustomerProfile> result = customerRepository.searchByQuery("2222", PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals("Bob", result.getContent().get(0).getFirstName());
    }

    @Test
    void existsByPhoneNumber_TrueAndFalse() {
        assertTrue(customerRepository.existsByPhoneNumber("+1111111111"));
        assertFalse(customerRepository.existsByPhoneNumber("+9999999999"));
    }
}
