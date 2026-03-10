package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.mapper.CustomerMapper;
import mls.sho.dms.application.service.impl.crm.CustomerServiceImpl;
import mls.sho.dms.entity.crm.*;
import mls.sho.dms.repository.crm.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock private CustomerProfileRepository customerRepository;
    @Mock private LoyaltyTierRepository tierRepository;
    @Mock private CustomerDietaryTagRepository dietaryTagRepository;
    @Mock private CustomerOccasionRepository occasionRepository;
    @Mock private LoyaltyTransactionRepository transactionRepository;
    @Mock private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private CustomerProfile mockProfile;

    @BeforeEach
    void setUp() {
        mockProfile = new CustomerProfile();
        mockProfile.setId(UUID.randomUUID());
        mockProfile.setPhoneNumber("+1234567890");
        mockProfile.setFirstName("John");
        mockProfile.setLastName("Doe");
        mockProfile.setDietaryTags(new ArrayList<>());
        mockProfile.setOccasions(new ArrayList<>());
        mockProfile.setAvailablePoints(100);
        mockProfile.setLifetimeSpend(new BigDecimal("50.00"));
        mockProfile.setVisitCount(1);
        mockProfile.setLastVisitAt(Instant.now());
    }

    @Test
    void createCustomer_DuplicatePhone_ThrowsException() {
        CreateCustomerRequest request = CreateCustomerRequest.builder().phoneNumber("+1234567890").build();
        when(customerRepository.findByPhoneNumber(request.getPhoneNumber())).thenReturn(Optional.of(mockProfile));

        assertThrows(BusinessRuleException.class, () -> customerService.createCustomer(request));
    }

    @Test
    void updateCustomer_ValidData_Success() {
        UUID id = mockProfile.getId();
        UpdateCustomerRequest request = new UpdateCustomerRequest("Jane", "Smith", "+9876543210", "jane@test.com", "notes", true, false);
        
        when(customerRepository.findById(id)).thenReturn(Optional.of(mockProfile));
        when(customerRepository.findByPhoneNumber(request.phoneNumber())).thenReturn(Optional.empty()); // No conflict
        when(customerRepository.save(any(CustomerProfile.class))).thenReturn(mockProfile);
        when(customerMapper.toResponse(any(CustomerProfile.class))).thenReturn(CustomerProfileResponse.builder().build());

        customerService.updateCustomer(id, request);

        verify(customerRepository).save(mockProfile);
        assertEquals("Jane", mockProfile.getFirstName());
        assertEquals("+9876543210", mockProfile.getPhoneNumber());
        assertFalse(mockProfile.isEmailOptIn());
    }

    @Test
    void searchCustomers_EmptyQuery_ReturnsAll() {
        Page<CustomerProfile> page = new PageImpl<>(List.of(mockProfile));
        when(customerRepository.findAllWithTier(any(Pageable.class))).thenReturn(page);
        
        customerService.searchCustomers("", Pageable.unpaged());
        
        verify(customerRepository).findAllWithTier(any(Pageable.class));
        verify(customerRepository, never()).searchByQuery(anyString(), any(Pageable.class));
    }

    @Test
    void addDietaryTag_DuplicateTag_ThrowsException() {
        CustomerDietaryTag existingTag = new CustomerDietaryTag();
        existingTag.setTagType(DietaryTagType.VEGAN);
        mockProfile.getDietaryTags().add(existingTag);

        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));

        AddDietaryTagRequest request = new AddDietaryTagRequest(DietaryTagType.VEGAN, null);
        assertThrows(BusinessRuleException.class, () -> customerService.addDietaryTag(mockProfile.getId(), request));
    }

    @Test
    void mergeProfiles_Success() {
        CustomerProfile target = mockProfile;
        
        CustomerProfile source = new CustomerProfile();
        source.setId(UUID.randomUUID());
        source.setAvailablePoints(50);
        source.setLifetimeSpend(new BigDecimal("25.00"));
        source.setVisitCount(3);
        
        when(customerRepository.findById(target.getId())).thenReturn(Optional.of(target));
        when(customerRepository.findById(source.getId())).thenReturn(Optional.of(source));

        MergeProfilesRequest request = new MergeProfilesRequest(source.getId(), target.getId());
        customerService.mergeProfiles(request);

        assertEquals(150, target.getAvailablePoints());
        assertEquals(new BigDecimal("75.00"), target.getLifetimeSpend());
        assertEquals(4, target.getVisitCount());
        
        verify(customerRepository).delete(source);
        verify(customerRepository).save(target);
    }
}
